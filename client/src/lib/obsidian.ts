import { localDayKey } from "@/lib/localState";

export type VaultFile = {
  getFile: () => Promise<File>;
  createWritable: () => Promise<{ seek: (position: number) => Promise<void>; write: (data: string) => Promise<void>; close: () => Promise<void> }>;
};
export type VaultDirectory = {
  name: string;
  queryPermission: (descriptor: { mode: "readwrite" }) => Promise<PermissionState>;
  requestPermission: (descriptor: { mode: "readwrite" }) => Promise<PermissionState>;
  getFileHandle: (name: string, options: { create: true }) => Promise<VaultFile>;
};
type PickerWindow = Window & {
  showDirectoryPicker?: (options: { mode: "readwrite" }) => Promise<VaultDirectory>;
};

export async function pickVaultDirectory(): Promise<{ directory?: VaultDirectory; message: string }> {
  const picker = (window as PickerWindow).showDirectoryPicker;
  if (!picker) return { message: "Folder access is not available here. Enter your vault's name below to use an Obsidian link." };
  try {
    const directory = await picker.call(window, { mode: "readwrite" });
    const permission = await directory.queryPermission({ mode: "readwrite" });
    if (permission === "denied") return { message: "Folder access was denied. You can try again or use an Obsidian link instead." };
    return { directory, message: `“${directory.name}” is ready in this browser session. Your notes stay in the folder you chose.` };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return { message: "No folder was selected. Nothing was connected." };
    return { message: "This browser could not open that folder. Try again or use the Obsidian app link." };
  }
}

export async function appendDailyNote(directory: VaultDirectory, content: string) {
  let permission = await directory.queryPermission({ mode: "readwrite" });
  if (permission !== "granted") permission = await directory.requestPermission({ mode: "readwrite" });
  if (permission !== "granted") throw new Error("Obsidian folder permission was not granted. Choose the folder again when you are ready.");
  const note = await directory.getFileHandle(`${localDayKey()}.md`, { create: true });
  const current = await note.getFile();
  const writer = await note.createWritable();
  await writer.seek(current.size);
  const prefix = current.size ? "\n" : "";
  await writer.write(`${prefix}- ${content}\n`);
  await writer.close();
}

export function createObsidianUri(vaultName: string, content: string) {
  const notePath = `${localDayKey()}.md`;
  return `obsidian://new?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(notePath)}&content=${encodeURIComponent(`- ${content}`)}&append=true`;
}

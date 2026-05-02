export type ProductSpecificationField = {
  key: string;
  label: string;
  multiline?: boolean;
};

export type ProductSpecificationSection = {
  key: string;
  title: string;
  fields: ProductSpecificationField[];
};

export const productSpecificationSections: ProductSpecificationSection[] = [
  {
    key: "display",
    title: "Display",
    fields: [
      { key: "size", label: "Size" },
      { key: "type", label: "Type" },
      { key: "resolution", label: "Resolution" },
      { key: "refreshRate", label: "Refresh Rate" },
      { key: "brightness", label: "Brightness", multiline: true },
      { key: "protection", label: "Protection" },
      { key: "features", label: "Features", multiline: true },
    ],
  },
  {
    key: "processor",
    title: "Processor",
    fields: [
      { key: "chipset", label: "Chipset" },
      { key: "cpuType", label: "CPU Type", multiline: true },
      { key: "gpu", label: "GPU" },
    ],
  },
  {
    key: "memory",
    title: "Memory",
    fields: [
      { key: "ram", label: "RAM" },
      { key: "rom", label: "ROM" },
    ],
  },
  {
    key: "rearCamera",
    title: "Rear Camera",
    fields: [
      { key: "resolution", label: "Resolution" },
      { key: "features", label: "Features", multiline: true },
      { key: "videoRecording", label: "Video Recording", multiline: true },
    ],
  },
  {
    key: "frontCamera",
    title: "Front Camera",
    fields: [
      { key: "resolution", label: "Resolution" },
      { key: "features", label: "Features", multiline: true },
    ],
  },
  {
    key: "audio",
    title: "Audio",
    fields: [
      { key: "speaker", label: "Speaker" },
      { key: "audioFeatures", label: "Audio Features", multiline: true },
    ],
  },
  {
    key: "networkConnectivity",
    title: "Network & Connectivity",
    fields: [
      { key: "sim", label: "SIM" },
      { key: "network", label: "Network", multiline: true },
      { key: "wifi", label: "Wi-Fi", multiline: true },
      { key: "bluetooth", label: "Bluetooth" },
      { key: "gps", label: "GPS", multiline: true },
      { key: "nfc", label: "NFC" },
      { key: "usb", label: "USB" },
      { key: "otg", label: "OTG" },
      { key: "audioJack", label: "Audio Jack" },
    ],
  },
  {
    key: "os",
    title: "OS",
    fields: [
      { key: "operatingSystem", label: "Operating System", multiline: true },
    ],
  },
  {
    key: "features",
    title: "Features",
    fields: [
      { key: "sensors", label: "Sensors", multiline: true },
      { key: "ipRating", label: "IP Rating" },
      { key: "otherFeatures", label: "Other Features", multiline: true },
    ],
  },
  {
    key: "battery",
    title: "Battery",
    fields: [
      { key: "type", label: "Type", multiline: true },
      { key: "fastCharging", label: "Fast Charging", multiline: true },
    ],
  },
  {
    key: "physicalSpecification",
    title: "Physical Specification",
    fields: [
      { key: "dimension", label: "Dimension", multiline: true },
      { key: "weight", label: "Weight" },
      { key: "colors", label: "Colors" },
    ],
  },
  {
    key: "warrantyInformation",
    title: "Warranty Information",
    fields: [{ key: "warranty", label: "Warranty", multiline: true }],
  },
];

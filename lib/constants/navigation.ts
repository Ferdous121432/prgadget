export type StaticNavSubSubCategory = {
  id: string;
  name: string;
  slug: string;
};

export type StaticNavSubCategory = {
  id: string;
  name: string;
  slug: string;
  subsubcategories?: StaticNavSubSubCategory[];
};

export type StaticNavCategory = {
  id: string;
  name: string;
  slug: string;
  subcategories?: StaticNavSubCategory[];
};

// Static snapshot collected from the database on 2026-05-02.
export const STATIC_NAV_CATEGORIES: StaticNavCategory[] = [
  {
    id: "61f3dbf3-e33f-4002-8b3b-8d02579cd836",
    name: " Headphone & Speaker",
    slug: "headphone-and-speaker",
    subcategories: [
      {
        id: "8aa6b208-c195-4ca6-a909-559286e739bd",
        slug: "airpods",
        name: "Airpods",
        subsubcategories: [],
      },
      {
        id: "814fa6ff-2237-4e78-81a1-fd69a40e6258",
        slug: "headphone",
        name: "Headphone",
        subsubcategories: [],
      },
      {
        id: "ac345ff0-4188-4c0f-94f3-829c174d6c3b",
        slug: "earphone",
        name: "Earphone",
        subsubcategories: [],
      },
      {
        id: "55cf32cc-529b-4534-8e93-02d574e4691a",
        slug: "soundbar",
        name: "Soundbar",
        subsubcategories: [],
      },
    ],
  },
  {
    id: "97bc17ed-d7dd-4f4f-afd5-7ba5219f2df4",
    name: "Apple",
    slug: "apple",
    subcategories: [
      {
        id: "5ec01542-0804-4cae-b226-41b236c38a8f",
        slug: "macbook",
        name: "MacBook",
        subsubcategories: [],
      },
      {
        id: "09bf151a-f607-43f5-b8f1-31847b1ce803",
        slug: "imac",
        name: "iMac",
        subsubcategories: [],
      },
      {
        id: "eec4d967-731e-4073-9327-f38449bc38e1",
        slug: "mac-studio",
        name: "Mac Studio",
        subsubcategories: [],
      },
      {
        id: "7eb2a7b6-2059-4d6b-bab3-3aa3348123c4",
        slug: "mac-mini",
        name: "Mac Mini",
        subsubcategories: [],
      },
    ],
  },
  {
    id: "6e7058f6-72eb-484d-8414-e044b3d47100",
    name: "Camera",
    slug: "camera",
    subcategories: [
      {
        id: "ea3743c5-8b34-4288-9254-43b3f60e8d0c",
        slug: "action-camera",
        name: "Action Camera",
        subsubcategories: [],
      },
      {
        id: "c21dab55-8cd7-4afa-8991-0a5463449214",
        slug: "gimbal",
        name: "Gimbal",
        subsubcategories: [],
      },
      {
        id: "b79ef806-4547-420e-b09b-558a329b33a3",
        slug: "ip-camera",
        name: "Ip Camera",
        subsubcategories: [],
      },
    ],
  },
  {
    id: "6bdf9472-99b2-4a93-b804-f62b000f9b7b",
    name: "Gadget",
    slug: "gadget",
    subcategories: [
      {
        id: "ce5e2dbc-91ed-4edd-a485-f73dfc1bb759",
        slug: "trimmer",
        name: "Trimmer",
        subsubcategories: [],
      },
      {
        id: "1a1a47da-a15b-4591-b5e3-b31406444e70",
        slug: "hair-dryer",
        name: "Hair Dryer",
        subsubcategories: [],
      },
      {
        id: "fdd21968-e72b-4c91-aef9-38fd2cae6d0d",
        slug: "air-purifier",
        name: "Air Purifier",
        subsubcategories: [],
      },
    ],
  },
  {
    id: "c97bd598-5def-4e18-87c7-ebba9a1b118a",
    name: "Phone Accessories",
    slug: "phone-accessories",
    subcategories: [
      {
        id: "76068fbd-a089-4e61-90eb-837b8a45d037",
        slug: "power-bank",
        name: "Power Bank",
        subsubcategories: [],
      },
      {
        id: "7e64919f-c79b-40ca-8917-f7b5a2d0c2fc",
        slug: "charger-and-adapter",
        name: "Charger & Adapter",
        subsubcategories: [
          {
            id: "d09a8cc6-0505-412d-b624-199fe2f46c64",
            slug: "wireless-charger",
            name: "Wireless Charger",
          },
          {
            id: "840fa66f-222f-41be-8b87-3b7ee787b432",
            slug: "cable-and-adapter",
            name: "Cable & Adapter",
          },
        ],
      },
    ],
  },
  {
    id: "840da724-1e19-43c7-9299-4a7243aa70e5",
    name: "Phones",
    slug: "phones",
    subcategories: [
      {
        id: "124d9639-db4a-4c0d-8307-524dda760e8c",
        slug: "iphone",
        name: "iPhone",
        subsubcategories: [],
      },
      {
        id: "509939ff-6ea0-4383-a02c-d71fe47840b2",
        slug: "samsung",
        name: "Samsung",
        subsubcategories: [],
      },
      {
        id: "6f0019e6-fee6-41c9-9808-cf72b3158c0a",
        slug: "honor",
        name: "Honor",
        subsubcategories: [],
      },
      {
        id: "a99f4a2d-8752-4e4c-9179-1109bf18e143",
        slug: "vivo",
        name: "Vivo",
        subsubcategories: [],
      },
      {
        id: "a8ab95dd-38c2-4a66-be1a-5803b7619a20",
        slug: "oppo",
        name: "Oppo",
        subsubcategories: [],
      },
      {
        id: "3932fc27-e8b4-4657-8591-604aa102218c",
        slug: "oneplus",
        name: "Oneplus",
        subsubcategories: [],
      },
    ],
  },
  {
    id: "607afdab-ac85-40f0-83f4-331adec35862",
    name: "Tablets",
    slug: "tablets",
    subcategories: [
      {
        id: "ec22a29d-0893-41aa-9fa4-2619e11acfd9",
        slug: "ipad",
        name: "iPad",
        subsubcategories: [],
      },
      {
        id: "9c75071f-2d9f-4a1f-8fd4-242eb9de227c",
        slug: "honor-tablets",
        name: "Honor",
        subsubcategories: [],
      },
      {
        id: "10316540-6255-49ae-824f-9135a61dacd3",
        slug: "huawei-tablet",
        name: "Huawei",
        subsubcategories: [],
      },
      {
        id: "24515349-5800-491c-a2bf-0faad222f688",
        slug: "samsung-tablet",
        name: "Samsung",
        subsubcategories: [],
      },
    ],
  },
  {
    id: "9a57c184-41cb-43ff-9f98-ef86f13249bd",
    name: "Watches",
    slug: "watches",
    subcategories: [
      {
        id: "9b275d69-65b4-4b63-a427-c7e8a00392a1",
        slug: "wrist-watch",
        name: "Wrist Watch",
        subsubcategories: [
          {
            id: "a706bf4f-cf9f-42ab-a5a0-c1b77d135dfb",
            slug: "men's-watch",
            name: "Men's Watch",
          },
          {
            id: "e0125332-e424-49af-ab6f-0b9609c6cc56",
            slug: "womens-watch",
            name: "Women's Watch",
          },
        ],
      },
      {
        id: "cca3ec7b-7391-406d-b9b7-fc26ffc271a4",
        slug: "smart-watch",
        name: "Smart Watch",
        subsubcategories: [
          {
            id: "576cadef-c2e6-49ad-a8bf-d9ea988b0e7f",
            slug: "apple",
            name: "Apple",
          },
          {
            id: "1311570b-1335-4bd4-8e10-142b5a65853d",
            slug: "samsung",
            name: "Samsung",
          },
          {
            id: "816b8bc2-1e70-4748-a91e-947c14db7d9c",
            slug: "huawei",
            name: "Huawei",
          },
        ],
      },
      {
        id: "67a4c283-2238-42c7-a6db-69275200906f",
        slug: "smart-band",
        name: "Smart Band",
        subsubcategories: [],
      },
      {
        id: "59dd81f1-9a4a-4a32-857b-a29fbb102d25",
        slug: "speaker",
        name: "Speaker",
        subsubcategories: [],
      },
    ],
  },
];

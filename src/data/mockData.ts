import { Client, Property, Task, ScriptureVerse, ProjectReport, Project } from "../types/app";

export const MOCK_CLIENTS: Client[] = [
  {
    id: "c1",
    name: "Arjun Mehta",
    email: "arjun.mehta@mehtatech.com",
    phone: "+91 98230 45671",
    company: "Mehta Technologies Pvt Ltd",
    status: "Active",
    joinedDate: "2026-01-15",
    address: "Bungalow No. 5, Koregaon Park, Pune, MH",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  },
  {
    id: "c2",
    name: "Dr. Sunita Sharma",
    email: "sunita.sharma@sharmaclinics.org",
    phone: "+91 91122 33445",
    company: "Sharma Wellness Group",
    status: "Active",
    joinedDate: "2026-03-22",
    address: "A-420, Sector 15, Dwarka, New Delhi",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
  },
  {
    id: "c3",
    name: "Vikram Singhania",
    email: "singhania.v@singhaniaindustries.com",
    phone: "+91 99887 76655",
    company: "Singhania Heavy Industries",
    status: "Pending",
    joinedDate: "2026-06-01",
    address: "Singhania House, Malabar Hill, Mumbai, MH",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
  },
  {
    id: "c4",
    name: "Pooja Hegde",
    email: "pooja.hegde@luxuryhomes.in",
    phone: "+91 88776 65544",
    company: "Hegde Luxury Boutique",
    status: "Active",
    joinedDate: "2026-04-10",
    address: "Penthouse B, DLF Phase 5, Gurugram, HR",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"
  },
  {
    id: "c5",
    name: "Rajesh Kulkarni",
    email: "kulkarni.r@paramountbuilders.com",
    phone: "+91 77665 54433",
    company: "Paramount Developers",
    status: "Inactive",
    joinedDate: "2025-11-05",
    address: "Flat 802, Signature Residency, Baner, Pune",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop"
  }
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "p1",
    name: "Mehta Tech HQ",
    clientId: "c1",
    ownerName: "Arjun Mehta",
    address: "Plot 12, Hinjewadi Phase 3, Pune, MH",
    plotSize: "18,500 sq.ft.",
    floors: 4,
    constructionStatus: "Completed",
    consultationStatus: "In Progress",
    energyRating: 74,
    directionsOffset: 8.5
  },
  {
    id: "p2",
    name: "Sharma Dwarka Residence",
    clientId: "c2",
    ownerName: "Dr. Sunita Sharma",
    address: "Plot 54, Sector 15, Dwarka, New Delhi",
    plotSize: "3,200 sq.ft.",
    floors: 3,
    constructionStatus: "Completed",
    consultationStatus: "Remedied",
    energyRating: 89,
    directionsOffset: -2.3
  },
  {
    id: "p3",
    name: "Singhania Foundry Plot",
    clientId: "c3",
    ownerName: "Vikram Singhania",
    address: "MIDC Industrial Area, Chakan, MH",
    plotSize: "125,000 sq.ft.",
    floors: 1,
    constructionStatus: "Planned",
    consultationStatus: "Pending",
    energyRating: 42,
    directionsOffset: 12.0
  },
  {
    id: "p4",
    name: "Hegde Gurugram Penthouse",
    clientId: "c4",
    ownerName: "Pooja Hegde",
    address: "Tower C, DLF Crest, Sector 54, Gurugram",
    plotSize: "4,800 sq.ft.",
    floors: 1,
    constructionStatus: "Completed",
    consultationStatus: "Verified",
    energyRating: 95,
    directionsOffset: 0.5
  },
  {
    id: "p5",
    name: "Paramount Baner Project",
    clientId: "c5",
    ownerName: "Rajesh Kulkarni",
    address: "S.No. 42, Near High Street, Baner, Pune",
    plotSize: "45,000 sq.ft.",
    floors: 11,
    constructionStatus: "Under Construction",
    consultationStatus: "In Progress",
    energyRating: 61,
    directionsOffset: 15.2
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    title: "Verify compass offset calibration",
    clientName: "Arjun Mehta",
    dueDate: "2026-07-10",
    priority: "High",
    status: "Pending"
  },
  {
    id: "t2",
    title: "Review binarized floorplan segments",
    clientName: "Vikram Singhania",
    dueDate: "2026-07-12",
    priority: "High",
    status: "Pending"
  },
  {
    id: "t3",
    title: "Compile remedy report dossier",
    clientName: "Dr. Sunita Sharma",
    dueDate: "2026-07-09",
    priority: "Medium",
    status: "Completed"
  },
  {
    id: "t4",
    title: "Publish certified Vastu seal",
    clientName: "Pooja Hegde",
    dueDate: "2026-07-15",
    priority: "Low",
    status: "Pending"
  },
  {
    id: "t5",
    title: "Collect ground elevation ratings",
    clientName: "Rajesh Kulkarni",
    dueDate: "2026-07-20",
    priority: "Medium",
    status: "Pending"
  }
];

export const MOCK_SCRIPTURES: ScriptureVerse[] = [
  {
    id: "sv1",
    book: "Mayamatam",
    chapter: "12",
    verse: "4",
    sanskrit: "ईशानकोणे देवगृहं पूर्वस्यां स्नानमन्दिरम् । आग्नेय्यां भोजनगृहं शयनं चोत्तरतः शुभम् ॥",
    translation: "Place the house of worship in the North-East (Ishana), the bathroom in the East, the kitchen in the South-East (Agni), and the bedroom in the North.",
    application: "Establishes elemental zone guidelines. Placing fire/heat elements in South-East and spiritual activities in North-East.",
    element: "Water"
  },
  {
    id: "sv2",
    book: "Samarangana Sutradhara",
    chapter: "18",
    verse: "23",
    sanskrit: "द्वारं तु सर्वसौख्याय मध्ये दक्षिणदिग्गते । न कुर्यात्कोणसंस्थाने द्वारं कस्यांचिदप्यतः ॥",
    translation: "An entrance placed in the center of the cardinal directions brings all auspiciousness. Avoid placing entrances at corner intersections.",
    application: "Rules for main entry gates (Mahadwara). Placing entries in beneficial padas (grid coordinates) rather than diagonal junctions.",
    element: "Space"
  },
  {
    id: "sv3",
    book: "Vishvakarma Prakash",
    chapter: "2",
    verse: "15",
    sanskrit: "गृहमध्ये न कर्तव्यं स्तम्भं कूपं हुताशनम् । ब्रह्मांशे वर्जयेत्सर्वं यदीच्छेत्कुशलं गृही ॥",
    translation: "At the center of the house (Brahmasthan), do not place pillars, wells, or fireplace. Keep this zone completely unburdened for prosperity.",
    application: "The Brahmasthan core rule. Must leave the exact center of any floorplan open, clean, and structurally free of load-bearing structures.",
    element: "Space"
  },
  {
    id: "sv4",
    book: "Mayamatam",
    chapter: "26",
    verse: "102",
    sanskrit: "नैर्ऋत्यं नैव कर्तव्यं जलं कूपं जलाशयम् । आग्नेये च न कर्तव्यं मृत्युदोषो भवेद्ध्रुवम् ॥",
    translation: "Never place water reservoirs, wells, or sumps in the South-West. Avoid placing them in South-East as well, as it brings severe energetic hazards.",
    application: "Liquid zoning regulations. Heavy water bodies belong strictly in the North/North-East, never in the Fire zone (South-East) or Earth zone (South-West).",
    element: "Earth"
  },
  {
    id: "sv5",
    book: "Manasara",
    chapter: "9",
    verse: "45",
    sanskrit: "वायव्ये धान्यगृहं च पश्चिमे भोजनं तथा । यमभागे च कर्तव्यं शयनं सर्वसौख्यदम् ॥",
    translation: "Place the grain storage or pantry in the North-West (Vayu), dining room in the West, and the master bedroom in the South (Yama) for ultimate peace.",
    application: "Zoning directions. North-West is Air element, perfect for movement and temporary storage. South is Earth/Stability, ideal for deep rest.",
    element: "Air"
  }
];

export const MOCK_REPORTS: ProjectReport[] = [
  {
    id: "r1",
    title: "Mehta Tech HQ Vastu Audit",
    propertyId: "p1",
    propertyName: "Mehta Tech HQ",
    clientId: "c1",
    clientName: "Arjun Mehta",
    dateCreated: "2026-07-01",
    summaryRating: 74,
    consultantNotes: "The corporate building has strong cardinal alignments, but suffers from a critical defect in the North-East quadrant where a server room generating heavy electrical heat is located. Recommended copper and zinc wire remediations, along with virtual elemental partitions.",
    status: "Draft",
    remedies: [
      {
        id: "rem1",
        zone: "North-East (NE)",
        defect: "Electrical Server Rack (Fire anomaly in Water quadrant)",
        remedy: "Install double-insulated lead partition bars, place natural aquamarine crystals, and isolate with virtual blue color lasers.",
        scriptureCitation: "Mayamatam, Ch. 12, Verse 4",
        severity: "High",
        status: "Identified"
      },
      {
        id: "rem2",
        zone: "South-West (SW)",
        defect: "Main Director cabin corner is cut off (Earth element deficit)",
        remedy: "Anchor with four heavy yellow jasper spheres in the SW corner and virtual brass pyramids.",
        scriptureCitation: "Vishvakarma Prakash, Ch. 6, Verse 18",
        severity: "Medium",
        status: "Implemented"
      }
    ]
  },
  {
    id: "r2",
    title: "Sharma Dwarka Residence Harmonic Certification",
    propertyId: "p2",
    propertyName: "Sharma Dwarka Residence",
    clientId: "c2",
    clientName: "Dr. Sunita Sharma",
    dateCreated: "2026-06-15",
    summaryRating: 89,
    consultantNotes: "Residential home conforms brilliantly to classical specifications. The master bed is aligned perfectly with the South magnetic vector. Minimal bathroom anomaly in West zone corrected via lead elemental bars.",
    status: "Approved",
    remedies: [
      {
        id: "rem3",
        zone: "West (W)",
        defect: "Bathroom draining through beneficial West-North-West pad",
        remedy: "Placed a thick solid white marble threshold on the doorframe to prevent energetic drain.",
        scriptureCitation: "Manasara, Ch. 9, Verse 45",
        severity: "Low",
        status: "Verified"
      }
    ]
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: "prj_1",
    name: "Mehta Tech HQ Vastu Restoration",
    code: "PRJ-3829",
    propertyId: "p1",
    propertyName: "Mehta Tech HQ",
    clientId: "c1",
    clientName: "Arjun Mehta",
    projectType: "Renovation",
    status: "In Progress",
    priority: "High",
    createdDate: "2026-06-10",
    lastUpdated: "2026-07-08",
    assignedConsultant: "Achyuta Rao",
    versions: [
      {
        id: "ver_1_1",
        name: "Ground Floor Plan V1",
        createdDate: "2026-06-11",
        createdBy: "Achyuta Rao",
        description: "Initial scan of floorplan focusing on server room heat coordinates.",
        drawings: [
          {
            id: "drw_1_1_1",
            name: "Ground_Floor_Server_Isolation.png",
            fileType: "PNG",
            url: "https://images.unsplash.com/photo-1545464693-f1798a373343?q=80&w=600&auto=format&fit=crop",
            uploadDate: "2026-06-11",
            fileSize: "1.4 MB",
            versionId: "ver_1_1"
          }
        ]
      },
      {
        id: "ver_1_2",
        name: "Ground Floor Plan Final",
        createdDate: "2026-06-25",
        createdBy: "Achyuta Rao",
        description: "Final layout with copper partitions added to the server room boundary.",
        drawings: [
          {
            id: "drw_1_2_1",
            name: "Ground_Floor_Final_Approved_Vastu.pdf",
            fileType: "PDF",
            url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
            uploadDate: "2026-06-25",
            fileSize: "3.2 MB",
            versionId: "ver_1_2"
          }
        ]
      }
    ],
    timeline: [
      {
        id: "evt_1_1",
        title: "Project Created",
        date: "2026-06-10",
        description: "Project registered for Arjun Mehta's Mehta Tech HQ",
        type: "created"
      },
      {
        id: "evt_1_2",
        title: "Drawing Uploaded",
        date: "2026-06-11",
        description: "Ground Floor Plan V1 uploaded for server isolation audit",
        type: "uploaded"
      },
      {
        id: "evt_1_3",
        title: "Revision Added",
        date: "2026-06-25",
        description: "Ground Floor Plan Final uploaded with correction vectors",
        type: "revision"
      },
      {
        id: "evt_1_4",
        title: "Consultation Started",
        date: "2026-06-26",
        description: "Interactive session initiated on the Floor Plan Studio",
        type: "started"
      },
      {
        id: "evt_1_5",
        title: "Analysis Completed",
        date: "2026-07-01",
        description: "All elemental and spatial defects identified and logged",
        type: "analysis"
      }
    ],
    notes: {
      privateNotes: "Client is extremely sensitive to timeline. Server room correction must be completed first.",
      clientQuestions: "Can we install brass wires instead of copper? Is yellow sapphire alternative acceptable?",
      siteVisitNotes: "Site has structural pillars at the margins but the central Brahmasthan is completely free of loads. Excellent.",
      pendingInformation: "Awaiting exact heights of mezzanine floor ceilings."
    },
    followUp: {
      nextMeeting: "2026-07-15 10:30 AM",
      reminder: "Call client to finalize copper strip supplier contact.",
      pendingTasks: [
        {
          id: "pt_1_1",
          title: "Validate server room shielding threshold",
          status: "Pending",
          dueDate: "2026-07-12"
        },
        {
          id: "pt_1_2",
          title: "Order Vastu Brass Pyramids for Southwest corner",
          status: "Pending",
          dueDate: "2026-07-14"
        }
      ],
      status: "Scheduled"
    }
  },
  {
    id: "prj_2",
    name: "Singhania Foundry Industrial Audit",
    code: "PRJ-7210",
    propertyId: "p3",
    propertyName: "Singhania Foundry Plot",
    clientId: "c3",
    clientName: "Vikram Singhania",
    projectType: "Industrial Audit",
    status: "Waiting for Client",
    priority: "High",
    createdDate: "2026-06-01",
    lastUpdated: "2026-07-09",
    assignedConsultant: "Achyuta Rao",
    versions: [
      {
        id: "ver_2_1",
        name: "Site Plan V1",
        createdDate: "2026-06-02",
        createdBy: "Achyuta Rao",
        description: "Initial raw CAD layout of the foundry furnace grid.",
        drawings: [
          {
            id: "drw_2_1_1",
            name: "Singhania_Foundry_CAD_V1.png",
            fileType: "PNG",
            url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=600&auto=format&fit=crop",
            uploadDate: "2026-06-02",
            fileSize: "4.2 MB",
            versionId: "ver_2_1"
          }
        ]
      }
    ],
    timeline: [
      {
        id: "evt_2_1",
        title: "Project Created",
        date: "2026-06-01",
        description: "Industrial Project registered for Vikram Singhania's Singhania Foundry Plot",
        type: "created"
      },
      {
        id: "evt_2_2",
        title: "Drawing Uploaded",
        date: "2026-06-02",
        description: "Site Plan V1 uploaded for raw furnace mapping",
        type: "uploaded"
      }
    ],
    notes: {
      privateNotes: "Heavy machinery placing is violating Southwest stability center. Weight needs correction.",
      clientQuestions: "Can we shift the furnace to the southeast zone safely without halting existing lines?",
      siteVisitNotes: "Foundry floor is heavily concrete reinforced. Hard to dig for metal rods.",
      pendingInformation: "Foundry drainage slope directions certificate from local surveyor."
    },
    followUp: {
      nextMeeting: "2026-07-20 02:00 PM",
      reminder: "Review water boring layout proposal.",
      pendingTasks: [
        {
          id: "pt_2_1",
          title: "Check electrical transformer placement details",
          status: "Pending",
          dueDate: "2026-07-18"
        }
      ],
      status: "Pending"
    }
  },
  {
    id: "prj_3",
    name: "Sharma Dwarka Residence Harmonic Alignment",
    code: "PRJ-1049",
    propertyId: "p2",
    propertyName: "Sharma Dwarka Residence",
    clientId: "c2",
    clientName: "Dr. Sunita Sharma",
    projectType: "Villa",
    status: "Completed",
    priority: "Medium",
    createdDate: "2026-05-15",
    lastUpdated: "2026-06-15",
    assignedConsultant: "Achyuta Rao",
    versions: [
      {
        id: "ver_3_1",
        name: "Ground & First Floor Plan",
        createdDate: "2026-05-18",
        createdBy: "Achyuta Rao",
        description: "Detailed residential layout. Master bed and bathrooms identified.",
        drawings: [
          {
            id: "drw_3_1_1",
            name: "Sharma_Dwarka_Floorplan.jpg",
            fileType: "JPG",
            url: "https://images.unsplash.com/photo-1545464693-f1798a373343?q=80&w=600&auto=format&fit=crop",
            uploadDate: "2026-05-18",
            fileSize: "2.1 MB",
            versionId: "ver_3_1"
          }
        ]
      }
    ],
    timeline: [
      {
        id: "evt_3_1",
        title: "Project Created",
        date: "2026-05-15",
        description: "Villa project registered for Sunita Sharma's Dwarka Residence",
        type: "created"
      },
      {
        id: "evt_3_2",
        title: "Drawing Uploaded",
        date: "2026-05-18",
        description: "Ground & First Floor Plan uploaded",
        type: "uploaded"
      },
      {
        id: "evt_3_3",
        title: "Consultation Started",
        date: "2026-05-20",
        description: "Vastu analysis started with interactive alignment",
        type: "started"
      },
      {
        id: "evt_3_4",
        title: "Analysis Completed",
        date: "2026-06-01",
        description: "Completed with high alignment score",
        type: "analysis"
      },
      {
        id: "evt_3_5",
        title: "Report Generated",
        date: "2026-06-15",
        description: "Dossier exported to client in Draft status",
        type: "report"
      }
    ],
    notes: {
      privateNotes: "Home is very auspicious. West bathroom is the only minor issue.",
      clientQuestions: "Is marble threshold sufficiently durable? Does it need replacement with metal?",
      siteVisitNotes: "Very calm neighborhood. Clean environment. Excellent energy levels.",
      pendingInformation: "Completed without pending inquiries."
    },
    followUp: {
      nextMeeting: "None Scheduled",
      reminder: "Follow-up in 6 months to check owner satisfaction.",
      pendingTasks: [
        {
          id: "pt_3_1",
          title: "Verify marble threshold installation satisfaction",
          status: "Completed",
          dueDate: "2026-06-30"
        }
      ],
      status: "Completed"
    }
  }
];


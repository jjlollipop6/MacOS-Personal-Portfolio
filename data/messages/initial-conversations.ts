import { Conversation } from "@/types/messages";

const getTimeAgo = (minutes: number) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutes);
  return date.toISOString();
};

export const initialConversations: Conversation[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    recipients: [
      { id: "b1c2d3e4-f5a6-7890-bcde-f12345678901", name: "Sundar Pichai" },
      { id: "c2d3e4f5-a6b7-8901-cdef-123456789012", name: "Vlad Tenev" },
      { id: "d3e4f5a6-b7c8-9012-defa-234567890123", name: "Eric Glyman" },
      { id: "e4f5a6b7-c8d9-0123-efab-345678901234", name: "John Ternus" },
      { id: "f5a6b7c8-d9e0-1234-fabc-456789012345", name: "Aravind Srinivas" },
      { id: "a6b7c8d9-e0f1-2345-abcd-567890123456", name: "Dario Amodei" },
    ],
    lastMessageTime: getTimeAgo(3),
    unreadCount: 4,
    pinned: true,
    messages: [
      {
        id: "m001-a1b2-c3d4-e5f6-789012345678",
        content: "heard you might be joining us soon 👀",
        sender: "Sundar Pichai",
        timestamp: "2026-04-26T10:00:00.000Z",
      },
      {
        id: "m002-b2c3-d4e5-f6a7-890123456789",
        content: "who added this guy lol",
        sender: "Aravind Srinivas",
        timestamp: "2026-04-26T10:00:28.000Z",
      },
      {
        id: "m003-c3d4-e5f6-a7b8-901234567890",
        content: "lol hi everyone",
        sender: "me",
        timestamp: "2026-04-26T10:01:02.000Z",
      },
      {
        id: "m004-d4e5-f6a7-b8c9-012345678901",
        content: "so what's your deal",
        sender: "Vlad Tenev",
        timestamp: "2026-04-26T10:01:30.000Z",
      },
      {
        id: "m005-e5f6-a7b8-c9d0-123456789012",
        content: "product analyst at JPMorgan right now",
        sender: "me",
        timestamp: "2026-04-26T10:02:00.000Z",
      },
      {
        id: "m006-f6a7-b8c9-d0e1-234567890123",
        content: "finance background or tech?",
        sender: "Eric Glyman",
        timestamp: "2026-04-26T10:02:22.000Z",
      },
      {
        id: "m007-a7b8-c9d0-e1f2-345678901234",
        content: "finance degree but I'm building AI tools all day",
        sender: "me",
        timestamp: "2026-04-26T10:02:48.000Z",
      },
      {
        id: "m008-b8c9-d0e1-f2a3-456789012345",
        content: "wait are you the one using Claude Code on Navigator?",
        sender: "Dario Amodei",
        timestamp: "2026-04-26T10:03:10.000Z",
      },
      {
        id: "m009-c9d0-e1f2-a3b4-567890123456",
        content: "yeah daily",
        sender: "me",
        timestamp: "2026-04-26T10:03:28.000Z",
      },
      {
        id: "m010-d0e1-f2a3-b4c5-678901234567",
        content: "love to hear it",
        sender: "Dario Amodei",
        timestamp: "2026-04-26T10:03:42.000Z",
        reactions: [
          {
            type: "like",
            sender: "Sundar Pichai",
            timestamp: "2026-04-26T10:03:50.000Z",
          },
        ],
      },
      {
        id: "m011-e1f2-a3b4-c5d6-789012345678",
        content: "the agentic IB testing platform — that was you?",
        sender: "Aravind Srinivas",
        timestamp: "2026-04-26T10:04:05.000Z",
      },
      {
        id: "m012-f2a3-b4c5-d6e7-890123456789",
        content: "yep. cut iteration cycles 15%. no more waiting on bankers",
        sender: "me",
        timestamp: "2026-04-26T10:04:28.000Z",
        reactions: [
          {
            type: "laugh",
            sender: "Vlad Tenev",
            timestamp: "2026-04-26T10:04:40.000Z",
          },
        ],
      },
      {
        id: "m013-a3b4-c5d6-e7f8-901234567890",
        content: "what's the stack look like",
        sender: "Sundar Pichai",
        timestamp: "2026-04-26T10:04:55.000Z",
      },
      {
        id: "m014-b4c5-d6e7-f8a9-012345678901",
        content: "self-learning agents + Claude Code mostly",
        sender: "me",
        timestamp: "2026-04-26T10:05:15.000Z",
      },
      {
        id: "m015-c5d6-e7f8-a9b0-123456789012",
        content: "ok real talk what do you do for fun",
        sender: "John Ternus",
        timestamp: "2026-04-26T10:05:35.000Z",
      },
      {
        id: "m016-d6e7-f8a9-b0c1-234567890123",
        content: "tennis. also built a computer vision system to track player movement",
        sender: "me",
        timestamp: "2026-04-26T10:05:58.000Z",
      },
      {
        id: "m017-e7f8-a9b0-c1d2-345678901234",
        content: "of course you did 😂",
        sender: "John Ternus",
        timestamp: "2026-04-26T10:06:15.000Z",
        reactions: [
          {
            type: "laugh",
            sender: "Eric Glyman",
            timestamp: "2026-04-26T10:06:22.000Z",
          },
        ],
      },
      {
        id: "m018-f8a9-b0c1-d2e3-456789012345",
        content: "wait you used to flip sneakers?",
        sender: "Vlad Tenev",
        timestamp: "2026-04-26T10:06:38.000Z",
      },
      {
        id: "m019-a9b0-c1d2-e3f4-567890123456",
        content: "Kicks_ByJJ. $105k revenue. started at 16",
        sender: "me",
        timestamp: "2026-04-26T10:06:58.000Z",
      },
      {
        id: "m020-b0c1-d2e3-f4a5-678901234567",
        content: "$105k from sneakers 💀",
        sender: "Eric Glyman",
        timestamp: "2026-04-26T10:07:16.000Z",
        reactions: [
          {
            type: "like",
            sender: "Aravind Srinivas",
            timestamp: "2026-04-26T10:07:24.000Z",
          },
        ],
      },
      {
        id: "m021-c1d2-e3f4-a5b6-789012345678",
        content: "limited editions + international buyers. also had an Amazon store",
        sender: "me",
        timestamp: "2026-04-26T10:07:40.000Z",
      },
      {
        id: "m022-d2e3-f4a5-b6c7-890123456789",
        content: "how much from the store",
        sender: "Aravind Srinivas",
        timestamp: "2026-04-26T10:07:58.000Z",
      },
      {
        id: "m023-e3f4-a5b6-c7d8-901234567890",
        content: "$40k. beauty and collectibles",
        sender: "me",
        timestamp: "2026-04-26T10:08:14.000Z",
      },
      {
        id: "m024-f4a5-b6c7-d8e9-012345678901",
        content: "ok we need to talk",
        sender: "Sundar Pichai",
        timestamp: "2026-04-26T10:08:32.000Z",
      },
      {
        id: "m025-a5b6-c7d8-e9f0-123456789012",
        content: "get in line Sundar",
        sender: "Dario Amodei",
        timestamp: "2026-04-26T10:08:50.000Z",
        reactions: [
          {
            type: "laugh",
            sender: "Vlad Tenev",
            timestamp: "2026-04-26T10:08:58.000Z",
          },
          {
            type: "laugh",
            sender: "John Ternus",
            timestamp: "2026-04-26T10:09:02.000Z",
          },
        ],
      },
    ],
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789013",
    recipients: [
      { id: "d4e5f6a7-b8c9-0123-defa-234567890124", name: "Matt Murphy" },
    ],
    lastMessageTime: getTimeAgo(82),
    unreadCount: 0,
    pinned: false,
    messages: [
      {
        id: "mm01-a1b2-c3d4-e5f6-789012345678",
        content: "silicon photonics is going to change everything in the next 5 years",
        sender: "Matt Murphy",
        timestamp: "2026-04-26T06:00:00.000Z",
      },
      {
        id: "mm02-b2c3-d4e5-f6a7-890123456789",
        content: "break it down for me",
        sender: "me",
        timestamp: "2026-04-26T06:00:45.000Z",
      },
      {
        id: "mm03-c3d4-e5f6-a7b8-901234567890",
        content: "instead of moving data with electrons you use light. faster, way less power",
        sender: "Matt Murphy",
        timestamp: "2026-04-26T06:01:20.000Z",
      },
      {
        id: "mm04-d4e5-f6a7-b8c9-012345678901",
        content: "so like fiber optics but built into the chip?",
        sender: "me",
        timestamp: "2026-04-26T06:01:58.000Z",
      },
      {
        id: "mm05-e5f6-a7b8-c9d0-123456789012",
        content: "exactly. we're integrating it directly into the silicon die. no external modules",
        sender: "Matt Murphy",
        timestamp: "2026-04-26T06:02:35.000Z",
      },
      {
        id: "mm06-f6a7-b8c9-d0e1-234567890123",
        content: "why does this matter so much for AI specifically",
        sender: "me",
        timestamp: "2026-04-26T06:03:10.000Z",
      },
      {
        id: "mm07-a7b8-c9d0-e1f2-345678901234",
        content: "GPU clusters need massive bandwidth between chips. copper interconnects are hitting a wall",
        sender: "Matt Murphy",
        timestamp: "2026-04-26T06:03:48.000Z",
      },
      {
        id: "mm08-b8c9-d0e1-f2a3-456789012345",
        content: "so photonics solves the bandwidth bottleneck",
        sender: "me",
        timestamp: "2026-04-26T06:04:22.000Z",
      },
      {
        id: "mm09-c9d0-e1f2-a3b4-567890123456",
        content: "bandwidth AND power. cuts interconnect energy by ~80%. that's a data center game changer",
        sender: "Matt Murphy",
        timestamp: "2026-04-26T06:05:00.000Z",
      },
      {
        id: "mm10-d0e1-f2a3-b4c5-678901234567",
        content: "that's massive for hyperscaler economics",
        sender: "me",
        timestamp: "2026-04-26T06:05:38.000Z",
      },
      {
        id: "mm11-e1f2-a3b4-c5d6-789012345678",
        content: "we're already shipping co-packaged optics to hyperscalers. this isn't future talk",
        sender: "Matt Murphy",
        timestamp: "2026-04-26T06:06:15.000Z",
      },
      {
        id: "mm12-f2a3-b4c5-d6e7-890123456789",
        content: "where does Marvell sit in all this",
        sender: "me",
        timestamp: "2026-04-26T06:06:50.000Z",
      },
      {
        id: "mm13-a3b4-c5d6-e7f8-901234567890",
        content: "we're leading it",
        sender: "Matt Murphy",
        timestamp: "2026-04-26T06:07:18.000Z",
      },
    ],
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678902",
    recipients: [
      { id: "c3d4e5f6-a7b8-9012-cdef-123456789013", name: "Elon Musk" },
    ],
    lastMessageTime: getTimeAgo(47),
    unreadCount: 0,
    pinned: false,
    hideAlerts: true,
    messages: [
      {
        id: "em01-a1b2-c3d4-e5f6-789012345678",
        content: "Starship is going to make Earth to Earth travel real. NYC to Tokyo in 30 mins",
        sender: "Elon Musk",
        timestamp: "2026-04-26T07:14:00.000Z",
      },
      {
        id: "em02-b2c3-d4e5-f6a7-890123456789",
        content: "Raptor 3 engine is a work of art. 280 bar chamber pressure. Nothing like it has ever flown",
        sender: "Elon Musk",
        timestamp: "2026-04-26T07:15:22.000Z",
      },
      {
        id: "em03-c3d4-e5f6-a7b8-901234567890",
        content: "Mars colony needs 1000 ships. We're building a fleet. This decade",
        sender: "Elon Musk",
        timestamp: "2026-04-26T07:17:05.000Z",
      },
      {
        id: "em04-d4e5-f6a7-b8c9-012345678901",
        content: "multiplanetary species or bust",
        sender: "Elon Musk",
        timestamp: "2026-04-26T07:18:33.000Z",
      },
    ],
  },
];

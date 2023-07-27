import { writable } from "svelte/store";
import type { Lyrics } from "../types";
import currentSong from "./currentSong";
import { customFetch } from "./functions";

export const lyrics = writable<Lyrics>({
  error: true,
  syncType: "NO_LYRICS",
  lines: [],
});

export async function refreshLyrics(): Promise<Lyrics> {
  if (import.meta.env.PUBLIC_MOCK_SERVER) {
    const possibleLyrics: Lyrics[] = [
      // synced lyrics
      {
        error: false,
        syncType: "LINE_SYNCED",
        lines: [
          {
            startTimeMs: 450,
            words: "Baby, this is what you came for",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 4270,
            words: "Lightning strikes every time she moves",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 11320,
            words: "And everybody's watchin' her",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 13110,
            words: "But she's looking at you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 17310,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 21240,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 24960,
            words: "You, ooh, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 31520,
            words: "Baby, this is what you came for",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 35220,
            words: "Lightning strikes every time she moves",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 42330,
            words: "And everybody's watchin' her",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 44810,
            words: "But she's looking at you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 48370,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 52220,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 55130,
            words: "You, ooh, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 61930,
            words: "You, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 63780,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 67760,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 71490,
            words: "You, ooh, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 77840,
            words: "We go fast with the game we play (game we play)",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 85590,
            words: "Who knows why it's gotta be this way (be this way)",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 93470,
            words: "We say nothin' more than we need (than we need)",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 101180,
            words: 'I say, "Your place" when we leave',
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 108780,
            words: "Baby, this is what you came for",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 112600,
            words: "Lightning strikes every time she moves",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 119730,
            words: "And everybody's watchin' her",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 122270,
            words: "But she's looking at you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 125760,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 129560,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 133420,
            words: "You, ooh, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 139240,
            words: "You, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 141130,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 145170,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 148910,
            words: "You, ooh, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 155450,
            words: "Baby, this is what you came for",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 159280,
            words: "Lightning strikes every time she moves, yeah",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 170630,
            words: "Baby, this is what you came for",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 174590,
            words: "Lightning strikes every time she moves",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 181650,
            words: "And everybody's watchin' her",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 184460,
            words: "But she's looking at you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 187810,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 191580,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 195470,
            words: "You, ooh, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 201390,
            words: "You, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 203310,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 207000,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 210920,
            words: "You, ooh, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 215870,
            words: "",
            syllables: [],
            endTimeMs: 0,
          },
        ],
      },
      // unsynced lyrics
      {
        error: false,
        syncType: "UNSYNCED",
        lines: [
          {
            startTimeMs: 0,
            words: "Baby, this is what you came for",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "Lightning strikes every time she moves",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "And everybody's watchin' her",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "But she's looking at you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "Baby, this is what you came for",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "Lightning strikes every time she moves",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "And everybody's watchin' her",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "But she's looking at you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "We go fast with the game we play (game we play)",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "Who knows why it's gotta be this way (be this way)",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "We say nothin' more than we need (than we need)",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: 'I say, "Your place" when we leave',
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "Baby, this is what you came for",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "Lightning strikes every time she moves",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "And everybody's watchin' her",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "But she's looking at you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "Baby, this is what you came for",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "Lightning strikes every time she moves, yeah",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "Baby, this is what you came for",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "Lightning strikes every time she moves",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "And everybody's watchin' her",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "But she's looking at you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, you, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "You, ooh, ooh, ooh",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 0,
            words: "",
            syllables: [],
            endTimeMs: 0,
          },
        ],
      },
      // no lyrics
      {
        error: true,
        syncType: "NO_LYRICS",
        lines: [],
      },
      // live data
      {
        _id: "63b01ea501b1cb581d960c70",
        spotifyUri: "spotify:track:2tpWsVSb9UEmDRxAl1zhX1",
        error: false,
        lines: [
          {
            startTimeMs: 490,
            words: "Lately, I've been, I've been losing sleep",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 5380,
            words: "Dreaming about the things that we could be",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 9000,
            words: "But baby, I've been, I've been praying hard",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 14090,
            words: 'Said, "No more counting dollars, we\'ll be counting stars"',
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 19260,
            words: "Yeah, we'll be counting stars",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 23940,
            words: "♪",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 37640,
            words: "I see this life, like a swinging vine",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 40490,
            words: "Swing my heart across the line",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 42290,
            words: "And in my face is flashing signs",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 44530,
            words: "Seek it out and ye shall find",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 46100,
            words: "Old, but I'm not that old",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 48260,
            words: "Young, but I'm not that bold",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 50290,
            words: "And I don't think the world is sold",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 52270,
            words: "On just doing what we're told",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 54590,
            words: "I feel something so right",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 59040,
            words: "Doing the wrong thing",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 62200,
            words: "And I feel something so wrong",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 67020,
            words: "Doing the right thing",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 70190,
            words: "I couldn't lie, couldn't lie, couldn't lie",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 73910,
            words: "Everything that kills me makes me feel alive",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 77920,
            words: "Lately, I've been, I've been losing sleep",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 82000,
            words: "Dreaming about the things that we could be",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 85330,
            words: "But baby, I've been, I've been praying hard",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 89850,
            words: 'Said, "No more counting dollars, we\'ll be counting stars"',
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 93600,
            words: "Lately, I've been, I've been losing sleep",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 97620,
            words: "Dreaming about the things we could be",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 101020,
            words: "But baby, I've been, I've been praying hard",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 105550,
            words:
              "Said, \"No more counting dollars, we'll be, we'll be counting stars\"",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 110920,
            words: "Yeah, yeah",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 116360,
            words: "I feel your love, and I feel it burn",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 119000,
            words: "Down this river, every turn",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 121090,
            words: "Hope is our four-letter word",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 122950,
            words: "Make that money, watch it burn",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 125080,
            words: "Old, but I'm not that old",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 126990,
            words: "Young, but I'm not that bold",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 128750,
            words: "And I don't think the world is sold",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 131140,
            words: "On just doing what we're told",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 133140,
            words: "And I feel something so wrong",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 137740,
            words: "Doing the right thing",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 140940,
            words: "I couldn't lie, couldn't lie, couldn't lie",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 144880,
            words: "Everything that drowns me makes me wanna fly",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 148640,
            words: "Lately, I've been, I've been losing sleep",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 152710,
            words: "Dreaming about the things that we could be",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 156270,
            words: "But baby, I've been, I've been praying hard",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 160620,
            words: 'Said, "No more counting dollars, we\'ll be counting stars"',
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 164320,
            words: "Lately, I've been, I've been losing sleep",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 168540,
            words: "Dreaming about the things that we could be",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 172060,
            words: "But baby, I've been, I've been praying hard",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 176370,
            words:
              "Said, \"No more counting dollars, we'll be, we'll be counting stars\"",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 182790,
            words: "Oh, take that money, watch it burn",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 185680,
            words: "Sink in the river the lessons I've learned",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 187920,
            words: "Take that money, watch it burn",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 189720,
            words: "Sink in the river the lessons I've learned",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 191880,
            words: "Take that money, watch it burn",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 193780,
            words: "Sink in the river the lessons I've learned",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 195800,
            words: "Take that money, watch it burn",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 197600,
            words: "Sink in the river the lessons I've learned",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 199760,
            words: "Everything that kills me makes me feel alive",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 206530,
            words: "Lately, I've been, I've been losing sleep",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 210760,
            words: "Dreaming about the things that we could be",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 214220,
            words: "But baby, I've been, I've been praying hard",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 218550,
            words: 'Said, "No more counting dollars, we\'ll be counting stars"',
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 222350,
            words: "Lately, I've been, I've been losing sleep",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 226580,
            words: "Dreaming about the things that we could be",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 230170,
            words: "But baby, I've been, I've been praying hard",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 234460,
            words:
              "Said, \"No more counting dollars, we'll be, we'll be counting stars\"",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 237870,
            words: "Take that money, watch it burn",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 239960,
            words: "Sink in the river the lessons I've learned",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 242020,
            words: "Take that money, watch it burn",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 243810,
            words: "Sink in the river the lessons I've learned",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 245950,
            words: "Take that money, watch it burn",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 247840,
            words: "Sink in the river the lessons I've learned",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 249880,
            words: "Take that money, watch it burn",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 251650,
            words: "Sink in the river the lessons I've learned",
            syllables: [],
            endTimeMs: 0,
          },
          {
            startTimeMs: 253210,
            words: "",
            syllables: [],
            endTimeMs: 0,
          },
        ],
        syncType: "LINE_SYNCED",
        validUntil: 1673091365872,
      } as unknown as Lyrics,
    ];
    const newLyrics = possibleLyrics[3];
    lyrics.set(newLyrics);

    //@ts-ignore
    window.lyrics = lyrics;

    return newLyrics;
  } else {
    const newLyrics = await customFetch<Lyrics | "noting playing">("lyrics");

    if (!newLyrics || newLyrics === "noting playing") {
      const errorLyrics: Lyrics = {
        error: true,
        syncType: "NO_LYRICS",
        lines: [],
      };
      lyrics.set(errorLyrics);
      return errorLyrics;
    }

    if (newLyrics.error === false)
      // convert string from api to number
      for (const lyric of newLyrics.lines)
        lyric.startTimeMs = Number(lyric.startTimeMs);
    else {
      // fill out fields to prevent errors
      newLyrics.syncType = "NO_LYRICS";
      newLyrics.lines = [];
    }

    lyrics.set(newLyrics);

    //@ts-ignore
    window.lyrics = newLyrics;

    return newLyrics;
  }
}

// refresh lyrics instantly when song changes
let lastSongName = "";
currentSong.subscribe((song) => {
  if (song.name !== lastSongName) {
    refreshLyrics();
    lastSongName = song.name;
  }
});

// refresh lyrics every 20 seconds
setInterval(
  refreshLyrics,
  import.meta.env.VITE_REFRESH_LYRICS_INTERVAL || 20 * 1000
);

export default lyrics;

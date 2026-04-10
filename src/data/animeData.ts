export interface Episode {
  id: string;
  animeId: string;
  title: string;
  videoUrl: string;
  downloadUrl: string;
  accessType: 'free' | 'premium' | 'locked';
  order: number;
}

export interface Anime {
  id: string;
  title: string;
  description: string;
  genre: string;
  posterUrl: string;
  episodes: Episode[];
  rating?: string;
  status?: string;
  type?: string;
  releaseYear?: string;
}

export const ANIME_DATA: Anime[] = [
  {
    id: 'demon-slayer',
    title: "Demon Slayer: Kimetsu no Yaiba",
    description: "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
    genre: "Action, Fantasy, Adventure",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZjZjNzI5MDctY2Y4YS00NmM4LTljMmItZTFkOTExNGI3ODRhXkEyXkFqcGdeQXVyNjc3MjQzNTI@._V1_.jpg",
    rating: "9.8",
    status: "Ongoing",
    type: "TV Series",
    releaseYear: "2019",
    episodes: [
      {
        id: 'ds-ep1',
        animeId: 'demon-slayer',
        title: 'Cruelty',
        videoUrl: 'https://www.dailymotion.com/video/x756789',
        downloadUrl: '',
        accessType: 'free',
        order: 1
      }
    ]
  },
  {
    id: 'jujutsu-kaisen',
    title: "Jujutsu Kaisen",
    description: "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman's school to be able to locate the demon's other body parts and thus exorcise himself.",
    genre: "Action, Supernatural, School",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNGYyNmI3M2EtYzgyZC00MGYxLWIxZDctOTNlM2M1Y2ZlY2ZlXkEyXkFqcGdeQXVyNjc3MjQzNTI@._V1_.jpg",
    rating: "9.5",
    status: "Ongoing",
    type: "TV Series",
    releaseYear: "2020",
    episodes: []
  },
  {
    id: 'attack-on-titan',
    title: "Attack on Titan",
    description: "After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.",
    genre: "Action, Drama, Fantasy",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNDFjYTIxMjctYTQ2ZC00YzQ4LWE3ZmMtN2MzMWQ4NGC6ZGNjXkEyXkFqcGdeQXVyNjc3MjQzNTI@._V1_.jpg",
    rating: "9.9",
    status: "Completed",
    type: "TV Series",
    releaseYear: "2013",
    episodes: []
  },
  {
    id: 'one-piece',
    title: "One Piece",
    description: "Follows the adventures of Monkey D. Luffy and his pirate crew in order to find the greatest treasure ever left by the legendary Pirate, Gold Roger. The famous mystery treasure named \"One Piece\".",
    genre: "Adventure, Action, Comedy",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BODcwNWE3OTItMDc3MS00NDFjLWE1OTAtNDU3NjgxODMxY2UyXkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_.jpg",
    rating: "9.7",
    status: "Ongoing",
    type: "TV Series",
    releaseYear: "1999",
    episodes: []
  },
  {
    id: 'naruto-shippuden',
    title: "Naruto: Shippuden",
    description: "Naruto Uzumaki, is a loud, hyperactive, adolescent ninja who constantly searches for approval and recognition, as well as to become Hokage, who is acknowledged as the leader and strongest of all ninja in the village.",
    genre: "Action, Adventure, Fantasy",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZGFiMWFhNDAtMzUyZS00NmQ2LTljNDYtMmZjNTc5MDUxMzViXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
    rating: "9.6",
    status: "Completed",
    type: "TV Series",
    releaseYear: "2007",
    episodes: []
  }
];

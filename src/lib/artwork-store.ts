import { createArtworkClient } from './artwork-catalogue';
import { artworkStorage } from './artwork-storage';
import { API_BASE_URL } from './mobile-api';

export const artworkStore = createArtworkClient({ storage: artworkStorage });
export const artworkEnvironment = API_BASE_URL;

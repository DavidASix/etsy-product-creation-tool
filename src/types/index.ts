export interface Poster {
  id: string;
  prompt: string;
  imageData: string; // base64 encoded image
  createdAt: Date;
  filepath: string;
}

export interface Mockup {
  id: string;
  posterId: string;
  propDescription: string;
  imageData: string; // base64 encoded image
  createdAt: Date;
  filepath: string;
}

export interface PosterGenerationRequest {
  prompt: string;
}

export interface MockupGenerationRequest {
  posterId: string;
  propDescription: string;
}

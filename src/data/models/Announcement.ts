export interface Announcement {
  id: string;
  caption: string;
  mediaUrls?: string[];
  mediaType?: 'image';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
  style?: {
    fontFamily?: string;
    fontSize?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: 'normal' | 'bold' | 'bolder';
  };
} 
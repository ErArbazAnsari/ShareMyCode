export interface SharedFile {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: Date;
}

export interface Gist {
    _id?: string;
    userId: string;
    user_fullName: string;
    gistViews: number;
    gistDescription: string;
    fileNameWithExtension: string;
    gistCode: string;
    sharedFile: SharedFile[];
    visibility: "public" | "private";
    createdAt: Date;
    updatedAt: Date;
    userImageUrl?: string;
}

export interface CreateGistData {
    gistDescription: string;
    fileNameWithExtension: string;
    gistCode: string;
    sharedFile?: SharedFile[];
    visibility: "public" | "private";
}

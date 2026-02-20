// ============================================
// Huddly — Core Type Definitions
// ============================================

/** User avatar customization */
export interface AvatarConfig {
    body: number;
    hair: number;
    hairColor: string;
    top: number;
    topColor: string;
    bottom: number;
    bottomColor: string;
    accessory: number;
    skinColor: string;
}

/** User profile */
export interface User {
    id: string;
    name: string;
    email: string;
    avatar: AvatarConfig;
    status: UserStatus;
    isGuest: boolean;
}

/** User presence status */
export type UserStatus = "available" | "focused" | "in-meeting" | "away" | "offline";

/** Room / Space */
export interface Room {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    template: RoomTemplate;
    visibility: "public" | "private" | "password";
    maxCapacity: number;
    mapData: MapData;
    thumbnail?: string;
    onlineCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export type RoomTemplate = "classroom" | "office" | "cafe" | "conference" | "party" | "blank";

/** Tiled-compatible map data */
export interface MapData {
    width: number;
    height: number;
    tileWidth: number;
    tileHeight: number;
    layers: MapLayer[];
    objects: MapObject[];
    tilesets: TilesetRef[];
}

export interface MapLayer {
    id: string;
    name: string;
    type: "tile" | "object";
    visible: boolean;
    data?: number[];
    objects?: MapObject[];
}

export interface MapObject {
    id: string;
    type: ObjectType;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    properties: Record<string, unknown>;
    sprite?: string;
}

export type ObjectType =
    | "desk"
    | "chair"
    | "sofa"
    | "whiteboard"
    | "tv"
    | "door"
    | "plant"
    | "podium"
    | "bookshelf"
    | "coffee-machine"
    | "arcade"
    | "decoration"
    | "wall"
    | "zone-private"
    | "zone-stage";

export interface TilesetRef {
    name: string;
    firstgid: number;
    tileWidth: number;
    tileHeight: number;
    imageUrl: string;
    columns: number;
}

/** Player state in a room (real-time synced) */
export interface PlayerState {
    userId: string;
    name: string;
    avatar: AvatarConfig;
    x: number;
    y: number;
    direction: Direction;
    isMoving: boolean;
    status: UserStatus;
    isMuted: boolean;
    isCameraOff: boolean;
    emote?: string;
}

export type Direction = "up" | "down" | "left" | "right" | "up-left" | "up-right" | "down-left" | "down-right";

/** Chat message */
export interface ChatMessage {
    id: string;
    userId: string;
    userName: string;
    content: string;
    type: "global" | "proximity" | "system";
    timestamp: Date;
}

/** Proximity connection */
export interface ProximityPeer {
    userId: string;
    distance: number;
    isConnected: boolean;
    stream?: MediaStream;
}

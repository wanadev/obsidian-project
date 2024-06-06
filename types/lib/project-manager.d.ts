import SerializableClass from "abitbol-serializable";
import type { Structure } from "./structure";

export interface WprjOptions {
    type: string
    metadataFormat: string
    projectFormat: string
    blobIndexFormat: string
}

export interface ProjectManagerOptions {
    mimetype?: string;
    fileExt?: string;
    metadata?: Record<string, unknown>;
    wprjOptions?: WprjOptions;
    version?: string;
}

export class ProjectManager extends SerializableClass {
    __name__: string;

    __init__(params?: ProjectManagerOptions): void;

    /**
     * The version of the project.
     */
    get version(): string;

    set version(value: string);

    getVersion(): string;

    setVersion(value: string): void;

    get mimetype(): string;

    set mimetype(value: string);

    getMimetype(): string;

    setMimetype(value: string): void;

    get fileExt(): string;

    set fileExt(value: string);

    getFileExt(): string;

    setFileExt(value: string): void;

    get wprjOptions(): WprjOptions;

    set wprjOptions(value: WprjOptions);

    getWprjOptions(): WprjOptions;

    setWprjOptions(value: WprjOptions): void;

    get metadata(): Record<string, unknown>;

    set metadata(value: Record<string, unknown>);

    getMetadata(): Record<string, unknown>;

    setMetadata(value: Record<string, unknown>): void;

    get layers(): Record<string, Structure[]>;

    getLayers(): Record<string, Structure[]>;

    /**
     * Add layers.
     */
    addLayers(...args: (string | string[])[]): void;

    /**
     * Remove given layers and destroy all structures they contain.
     */
    removeLayers(...args: (string | string[])[]): void;

    /**
     * Get a layer by name.
     */
    getLayer(name: string): Structure[];

    get structures(): Record<string, Structure>;

    getStructures(): Record<string, Structure>;

    /**
     * Add a structure to the project.
     */
    addStructure(structure: Structure, layerName?: string): void;

    /**
     * Remove a structure from the project.
     */
    removeStructure(structure: Structure | string): void;

    /**
     * Change the structure's current layer.
     */
    setStructureLayer(structure: Structure | string, layerName?: string): void;

    /**
     * Change the structure's position within its layer relatively to its current position.
     */
    moveStructure(structure: Structure | string, delta: number): void;

    /**
     * Change the structure's position within its layer to the specified index.
     */
    setStructureIndex(structure: Structure | string, index: number): void;

    /**
     * Save a project as Node.js Buffer.
     */
    saveAsBuffer(): Buffer;

    /**
     * Save a project as data64 URL.
     */
    saveAsData64Url(): string;

    /**
     * Save a project as Blob.
     */
    saveAsBlob(): Blob;

    newEmptyProject(metadata?: Record<string, unknown>): void;

    /**
     * Open a project from a Node.js Buffer.
     */
    openFromBuffer(buffer: Buffer): void;

    /**
     * Open a project from a data64 URL.
     */
    openFromData64Url(data64Url: string): void;

    /**
     * Open a project from a Blob.
     */
    openFromBlob(blob: Blob, callback: CallableFunction): Promise<void>;

    /**
     * Open a project from an URL (HTTP request).
     */
    openFromUrl(url: string, callback: CallableFunction): Promise<void>;

    /**
     * Add a blob to the project from a Blob/File.
     *
     * options:
     *
     *     {
     *         mime: "application/octet-stream",
     *         metadata: {}
     *     }
     *
     * @returns The blob id.
     */
    addBlob(blob: Blob, options: any, callback: CallableFunction): Promise<string>;

    /**
     * Add a blob to the project from a Node.js Buffer.
     *
     * options:
     *
     *     {
     *         mime: "application/octet-stream",
     *         metadata: {}
     *     }
     *
     * @returns The blob id.
     */
    addBlobFromBuffer(buffer: Buffer, options: any): string;

    /**
     * Add a blob to the project from a data64 URL.
     *
     * options:
     *
     *     {
     *         mime: "application/octet-stream",
     *         metadata: {}
     *     }
     *
     * @returns The blob id.
     */
    addBlobFromData64Url(data64Url: string, options: any): string;

    /**
     * Add a blob to the project from an Image.
     *
     * options:
     *
     *     {
     *         mime: "application/octet-stream",
     *         metadata: {}
     *     }
     *
     * WARNING: be careful of the CORS!
     * Requesting an external image will just fail.
     *
     * @returns The blob id.
     */
    addBlobFromImage(image: any, options: any): string;

    /**
     * Add a blob to the project from an URL
     *
     * options:
     *
     *     {
     *         mime: "application/octet-stream",
     *         metadata: {}
     *     }
     *
     * @returns The blob id.
     */
    addBlobFromUrl(url: string, options: any, callback: CallableFunction): Promise<string>;

    /**
     * Get a blob as a Node.js Buffer.
     *
     * @returns the blob.
     */
    getBlobAsBuffer(id: string): Buffer;

    /**
     * Get a blob as a Blob.
     *
     * @returns the blob.
     */
    getBlob(id: string): Blob;

    /**
     * Get a blob as a data64 URL.
     *
     * @returns the blob.
     */
    getBlobAsData64Url(id: string): string;

    /**
     * Get a blob as a Blob URL.
     *
     * @returns the blob URL.
     */
    getBlobAsUrl(id: string): string;

    /**
     * Get a blob as an Image
     *
     * @returns the blob
     */
    getBlobAsImage(id: string): Promise<any>;


    /**
     * Get metadata of a blob.
     */
    getBlobMetadata(id: string): Record<string, unknown>;

    /**
     * Remove a blob.
     */
    removeBlob(id: string): void;

    /**
     * Get an array of all blobs.
     */
    getBlobList(): Blob[];

    /**
     * Check whether a blob exists or not.
     */
    blobExists(id: string): boolean;

    /**
     * Add a new filter to convert from a previous version.
     */
    addVersionFilter(sourceSemver: string, targetVersion: string, convert: CallableFunction): void;

    /**
     * Handles unserialization errors (like missing serializers,...)
     *
     * By default it only rethrows the unserialization error, but it can
     * be overriden to handle gracefully the error.
     *
     * This method can be used to return a "repaired" structure to insert
     * in the project
     */
    unserializationErrorHandler(layer: string, data: any, error: Error): void;

    serialize(): any;

    unserialize(data: any): void;
}

export default ProjectManager;

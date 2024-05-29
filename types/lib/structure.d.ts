import SerializableClass from "abitbol-serializable";
import type { ProjectManager } from "./project-manager";

export class Structure extends SerializableClass {
    get project(): ProjectManager;

    get layer(): Structure[];

    destroy(): void;
}

export default Structure;

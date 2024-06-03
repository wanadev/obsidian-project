import Class from "abitbol";
import { ProjectManager } from "./project-manager";

export class History extends Class {

    __init__(pm: ProjectManager, params?: { maxLength?: number }): void;

    destroy(): void;

    /**
     * Max amount of snapshots stored by the history.
     */
    get maxLength(): number;

    getMaxLength(): number;

    /**
     * Currently stored snapshots count.
     */
    get length(): number;

    getLength(): number;

    /**
     * Take a snapshot of the current state of the project and put it into the history.
     * This snapshot will become the new head, all upbranch ones will be removed.
     */
    snapshot(): void;

    /**
     * Go backwards or forwards in history.
     * Positive delta is forwards, negative one is backwards.
     * This will change the current project to the saved version.
     */
    go(delta: number): void;

    /**
     * Reapply the currently pointed snapshot over the project.
     */
    applyCurrentSnapshot(): void;

    /**
     * Go backwards in history.
     */
    back(): void;

    /**
     * Go forwards in history.
     */
    forward(): void;

    /**
     * Test the delta reachability with go.
     * Returns the effective delta that will occur.
     * Therefore, a return value of 0 means nothing will change.
     *
     * @returns Effective delta that will occur.
     */
    simulate(delta: number): number;

    /**
     * Remove all snapshots from history.
     */
    clear(): void;
}

export default History;

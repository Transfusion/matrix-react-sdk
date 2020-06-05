/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const TILE_HEIGHT_PX = 44;

interface ISerializedListLayout {
    numTiles: number;
}

export class ListLayout {
    private _n = 0;

    constructor(public readonly tagId) {
        const serialized = localStorage.getItem(this.key);
        if (serialized) {
            // We don't use the setters as they cause writes.
            const parsed = <ISerializedListLayout>JSON.parse(serialized);
            this._n = parsed.numTiles;
        }
    }

    public get tileHeight(): number {
        return TILE_HEIGHT_PX;
    }

    private get key(): string {
        return `mx_sublist_layout_${this.tagId}_boxed`;
    }

    public get visibleTiles(): number {
        return Math.max(this._n, this.minVisibleTiles);
    }

    public set visibleTiles(v: number) {
        this._n = v;
        localStorage.setItem(this.key, JSON.stringify(this.serialize()));
    }

    public get minVisibleTiles(): number {
        return 3;
    }

    public tilesToPixels(n: number): number {
        return n * this.tileHeight;
    }

    public pixelsToTiles(px: number): number {
        return px / this.tileHeight;
    }

    private serialize(): ISerializedListLayout {
        return {
            numTiles: this.visibleTiles,
        };
    }
}

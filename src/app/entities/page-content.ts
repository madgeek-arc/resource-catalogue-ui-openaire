/**
 * Created by stefania on 7/17/17.
 */
export interface PageContent {
    content: PositionContents;
    route: string;
    _id: string;
    name: string;
}

/** A page's help texts by position; the API leaves out a position that has none. */
export interface PositionContents {
    top?: Content[];
    right?: Content[];
    bottom?: Content[];
    left?: Content[];
}

export interface Content {
    _id: string;
    page: Page | string;
    placement: string;
    order: number;
    content: string;
    isActive: boolean;
}

export interface Page {
    _id: string;
    route: string;
    name: string;
}

import type { CenterPageLink } from "@/config/franchise-center-page-nav";
import { uploadSourcePathForLink } from "@/lib/centre-page-nav-custom";
import type { FranchiseHubDoc } from "@/components/dashboard/franchise/FranchiseResourceFileRow";

export type AdminCenterPageUploadContext = {
    /** Display path, e.g. Academic Documents › Block Material › Block-1 › Playgroup ZIP */
    breadcrumb: string[];
    breadcrumbLabel: string;
    topTitle: string;
    groupTitle?: string;
    nestedTitle?: string;
    linkLabel: string;
    category: string;
    sourcePath: string;
    checklistHref: string;
    rowKey?: string;
    matchedDocId?: number;
};

export function sourcePathFromChecklistLink(link: CenterPageLink): string {
    return uploadSourcePathForLink(link);
}

export function buildAdminUploadContext(args: {
    topTitle: string;
    groupTitle?: string;
    nestedTitle?: string;
    link: CenterPageLink;
    matchedDocId?: number;
}): AdminCenterPageUploadContext | null {
    const category = args.link.adminCategory?.trim();
    if (!category) return null;

    const breadcrumb = [
        args.topTitle,
        args.groupTitle,
        args.nestedTitle,
        args.link.label,
    ].filter((part): part is string => Boolean(part?.trim()));

    const sourcePath = uploadSourcePathForLink(args.link);

    return {
        breadcrumb,
        breadcrumbLabel: breadcrumb.join(" › "),
        topTitle: args.topTitle,
        groupTitle: args.groupTitle,
        nestedTitle: args.nestedTitle,
        linkLabel: args.link.label,
        category,
        sourcePath,
        checklistHref: args.link.href,
        rowKey: args.link.rowKey,
        matchedDocId: args.matchedDocId,
    };
}

export function findHubDocById(docs: FranchiseHubDoc[], id?: number): FranchiseHubDoc | undefined {
    if (id == null) return undefined;
    return docs.find((d) => d.id === id);
}

'use client';

import Card from '@/components/ui/Card';
import type { FranchisePageData } from '@/config/franchise-page-defaults';

type MainBranch = FranchisePageData['main_branch'];

export default function FranchiseMainBranchContactCard({
    branch,
    officeTitle,
    addressHtml,
    addressLabel = 'Address',
    showAdmissionEmail = true,
    showPhone = true,
    isRegionalOffices = false,
}: {
    branch: MainBranch;
    officeTitle?: string;
    addressHtml?: string;
    addressLabel?: string;
    showAdmissionEmail?: boolean;
    showPhone?: boolean;
    /** Enables aligned state / city / phone grid for regional office HTML */
    isRegionalOffices?: boolean;
}) {
    const title = officeTitle?.trim() || branch.office_title;
    const address = addressHtml?.trim() || branch.address_html;
    return (
        <Card className="flex h-full flex-col justify-center">
            <h3 className="font-bubblegum mb-6 text-2xl tracking-wide text-gray-900">{title}</h3>

            <div className="space-y-4">
                <div className="flex items-start space-x-3">
                    <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
                        <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="mb-1 font-semibold text-gray-900">{addressLabel}</p>
                        <div
                            className={
                                isRegionalOffices || address.includes("tk-regional-offices")
                                    ? "tk-regional-offices-host text-gray-600"
                                    : "leading-relaxed text-gray-600"
                            }
                            dangerouslySetInnerHTML={{ __html: address }}
                        />
                    </div>
                </div>

                {showPhone ? (
                    <div className="flex items-start space-x-3">
                        <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
                            <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="mb-1 font-semibold text-gray-900">Phone</p>
                            <p className="text-gray-600">Cell: {branch.cell}</p>
                            <p className="text-gray-600">{branch.phone}</p>
                            <p className="mt-1 text-sm text-gray-500">Fax: {branch.fax}</p>
                        </div>
                    </div>
                ) : null}

                <div className="flex items-start space-x-3">
                    <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
                        <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="mb-1 font-semibold text-gray-900">Email</p>
                        {showAdmissionEmail ? (
                            <p className="text-gray-600">Admission Enquiry : {branch.email}</p>
                        ) : null}
                        <p className={showAdmissionEmail ? 'mt-1 text-gray-600' : 'text-gray-600'}>
                            Franchise Enquiry : {branch.franchise_email}
                        </p>
                    </div>
                </div>

            </div>
        </Card>
    );
}

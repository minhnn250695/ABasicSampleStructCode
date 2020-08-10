
export class CompanyResource {
    id: string;
    crmurl: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    stateOrProvince: string;
    postalCode: string;
    phone: string;
    email: string;
    companyLogoPath: string;
    socialMedias: SocialMedias[];
    registerName: string;
    registerNumber: number;
    licenseNumber: number;
}

class SocialMedias {
    socialMediaType: number;
    url: string;
}
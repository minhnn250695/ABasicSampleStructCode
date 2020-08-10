import { SocialMedia } from './social-media.model';
import { SocialMediaType } from './social-media-type.model';

export class SetupStep3 {

    companyId: string;
    logoPath: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    stateOrProvince: string;
    postalCode: string;
    email: string;
    phone: string;
    socialMedias: SocialMedia[];

    constructor() {
        this.socialMedias = new Array<SocialMedia>();
        this.socialMedias.push(new SocialMedia("facebook", SocialMediaType.Facebook));
        this.socialMedias.push(new SocialMedia("twitter", SocialMediaType.Twitter));
        this.socialMedias.push(new SocialMedia("youtube", SocialMediaType.Youtube));
        this.socialMedias.push(new SocialMedia("LinkedIn", SocialMediaType.Linkedin));
    }
}
import { SocialMediaType } from './social-media-type.model';

export class SocialMedia {

    socialMediaType: SocialMediaType;
    name: string;
    url: string;

    constructor(name: string, mediaType: SocialMediaType) {
        this.name = name;
        this.socialMediaType = mediaType;
    }
}
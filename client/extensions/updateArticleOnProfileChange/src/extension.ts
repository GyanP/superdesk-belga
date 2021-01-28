import {
    ISuperdesk,
    IExtension,
    IExtensionActivationResult,
    IArticle,
} from 'superdesk-api';

const extension: IExtension = {
    id: 'updateArticleOnContentProfileChange',
    activate: (superdesk: ISuperdesk) => {
        const result: IExtensionActivationResult = {
            contributions: {
                authoring: {
                    onUpdateBefore: (current: IArticle, next: IArticle) => {
                        if (current.profile == null || next.profile == null) {
                            return Promise.resolve(next);
                        }
                        return Promise.all([
                            superdesk.entities.contentProfile.get(current.profile),
                            superdesk.entities.contentProfile.get(next.profile),
                        ]).then((res) => {
                            const nextProfile = res[1];

                            if (nextProfile.label !== 'ALERT') {
                                return Promise.resolve({
                                    ...next,
                                    urgency: 3,
                                    subject: (next.subject ?? [])
                                        .filter((item: any) => item?.scheme !== 'distribution')
                                        .concat({
                                            qcode: 'default',
                                            name: 'default',
                                            scheme: 'distribution'
                                        }),
                                });
                            } else if (nextProfile.label === 'ALERT') {
                                return Promise.resolve({
                                    ...next,
                                    urgency: 1,
                                    subject: (next.subject ?? [])
                                        .filter((item: any) => item?.scheme !== 'distribution')
                                        .concat({
                                            qcode: 'bilingual',
                                            name: 'bilingual',
                                            scheme: 'distribution'
                                        }),
                                });
                            } else {
                                return Promise.resolve(next);
                            }
                        });
                    },
                },
            },
        };

        return Promise.resolve(result);
    },
};

export default extension;

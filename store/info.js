import {defineStore} from 'pinia'

export const useInfoStore = defineStore('info', {
    state: () => {
        return {
            openIndex: false,
            allKeywords: [],
            merchantId: '',
            merchant: {},
            licenseKey: '',
        }
    },
    actions: {
        setOpenIndex(value) {
            this.openIndex = value;
        },
        setAllKeywords(value) {
            this.allKeywords = value;
        },
        setMerchantId(value) {
            this.merchantId = value;
        },
        setMerchant(value) {
            this.merchant = value;
        },
        setLicenseKey(value) {
            this.licenseKey = value;
        }
    }
})
import {
    API_DOMAIN,
    DOMAIN
} from "./request";
import qs from 'qs'


export function requestInterceptor() {
    uni.addInterceptor("request", {
        invoke(args) {
            if (args.url.indexOf("http") !== 0) {
                args.url = API_DOMAIN + args.url;
            }

            const header = args.header || {};
            // header['X-Access-Token'] = uni.getStorageSync('token')
            args.header = header

            const data = args.data || {};
            if (args.method == 'GET') {
                let params = args.url.split('?')[1]
                let urlQuery = qs.parse(params)
                Object.assign(urlQuery, data)
                let url = args.url.split('?')[0]
                console.log(qs.stringify(data, {
                    encode: false,
                }))
                args.url = url + '?' + qs.stringify(data)
            } else {
                args.data = data;
            }
            console.log(`${args.method}: ${args.url}`, args.data);
            return args;
        },
        success: (res) => {
            console.log(res.header)
            if (res.header['content-type']!== 'text/event-stream') {
                if (!res.data.success) {
                    uni.showToast({
                        title: res.data.message,
                        icon: 'none'
                    })
                }
                if (res.data.code == 401) {
                    uni.showToast({
                        title: '登录过期',
                        icon: 'none'
                    })
                // uni.removeStorageSync('token')
                // uni.reLaunch({
                //     url: '/pages/login/login'
                // })

                }
            }
            
        },
    });
    uni.addInterceptor("uploadFile", {
        invoke(args) {
            if (args.url.indexOf("http") !== 0) {
                args.url = API_DOMAIN + args.url;
            }

            const header = args.header || {};
            // header['X-Access-Token'] = uni.getStorageSync('token')
            args.header = header

            return args;
        },
    });
    uni.addInterceptor("downloadFile", {
        invoke(args) {
            if (args.url.indexOf("http") !== 0) {
                args.url = DOMAIN + args.url;
            }

            const header = args.header || {};
            // header['X-Access-Token'] = uni.getStorageSync('token')
            args.header = header

            return args;
        },
    });
}
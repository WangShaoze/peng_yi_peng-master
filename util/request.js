let _DOMAIN = 'https://pyp.ylkj668.com/jeecg-boot'; // 生产环境默认地址
if (process.env.NODE_ENV === 'development') {
    // _DOMAIN = 'http://127.0.0.1:4523/m1/374563-419298-default';
    // _DOMAIN = 'https://5959387f.r19.cpolar.top/jeecg-boot';
    //_DOMAIN = 'https://pyp.ylkj668.com/jeecg-boot';
	_DOMAIN = 'http://192.168.3.87:8080/jeecg-boot';
}

export const DOMAIN = _DOMAIN

export const API_DOMAIN = DOMAIN;

export const http = {
    request: async (url, method, data, header = {}) => {

        const res = await uni.request({
            url: url,
            method: method,
            header: header,
            data: data,
        })
        if (res.data.code == 200) {
            return res.data
        }
        throw new Error(res.data.message)
    },
    get: async (url, data, header = {}) => {
        const res = await http.request(url, 'GET', data, header)
        return res
    },
    post: async (url, data, header = {}) => {
        uni.showLoading({
            title: '请稍候',
            mask: true
        })
        const res = await http.request(url, 'POST', data, header)
        uni.hideLoading()
        if (res.code == 200) {
            res.message && uni.showToast({
                title: res.message,
                icon: 'none',
            })
        }
        return res
    },
    upload: async (file) => {
        const res = await uni.uploadFile({
            url: '/sys/common/upload',
            filePath: file,
            name: 'file',
        })
        const data = JSON.parse(res.data)
        if (!data.success) {
            uni.showToast({
                title: data.message,
                icon: 'none',
            })
            throw new Error(data)
        }
        return data
    }
}
<template>
	<view>
		<image v-if="is_wechat" mode="widthFix" class="w-full" src="@/static/tip_wechat.png"></image>
		<view v-else>
			<div class="aspect-[3/2] !-mx-[20px]">
				<image class="!size-full" mode="aspectFill" :src="merchant.merchantMainPic">
				</image>
			</div>
			<view class=" bg-[#FFFCF4] !-mt-[22px] px-[20px] py-[15px] relative" style="border-radius: 20px 20px  0 0;">
				<view class=" font-bold">{{ merchant.merchantName }}</view>
				<view class="dir tag-dir" v-if="merchant.id">
					<text class="tag" v-for="item in (merchant.keywords || [])">{{ item }}</text>
				</view>
				<template v-for="(item1, index1) in platforms" :key="index1">
					<view v-if="index1 !== 'list3'" class="!grid grid-cols-2 gap-[15px] !mt-[25px] dir list-1">
						<template v-for="(item2, index2) in item1" :key="index1">
							<view v-if="enablePlatform[item2.name]"
								class="!flex items-center !bg-white px-[22px] py-[20px] item" @click="toSelect(item2)">
								<image :src="item2.icon" class="!w-[40px] !h-[40px] !mr-[15px]" mode="aspectFit">
								</image>
								<view>
									<view class="text-[14px] font-bold"><text>{{ item2.label }}</text></view>
									<view class="text-[11px] text-[#666666] !mt-[5px]"><text>{{ item2.desc }}</text>
									</view>
								</view>
							</view>
						</template>
					</view>
					<view v-else class="list-3">
						<template v-for="(item2, index2) in item1" :key="index">
							<view class="item" v-if="enablePlatform[item2.name]" @click="toSelect(item2)">
								<image class="bg" mode="widthFix" src="@/static/item-bg.png"></image>
								<view class=" absolute top-0 left-0 right-0 !flex flex-col items-center !-mt-[13px]">
									<image class="icon" mode="aspectFit" :src="item2.icon"></image>
									<view class="name">{{ item2.label }}</view>
								</view>
							</view>
						</template>
					</view>
				</template>

				<view v-if="merchant.wifiUser" class="!mt-[35px] relative" @click="connectionWifi">
					<image class="!w-full" mode="widthFix" src="@/static/Group 46.png"></image>
					<view class="text-[14px] absolute" style="top: 7.5vw;left: 22vw;">
						<view>
							<text class="text-[#666666]">Wi-Fi名称：</text><text>{{ merchant.wifiUser }}</text>
						</view>
						<view>
							<text class="text-[#666666]">密码：</text><text>******</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { useInfoStore } from '@/store/info';

function isWeChatBrowser() {
	// 获取浏览器的 userAgent 信息
	const userAgent = navigator.userAgent.toLowerCase();
	// 微信浏览器的 userAgent 中会包含 'micromessenger' 字符串
	return userAgent.indexOf('micromessenger') !== -1;
}

export default {
	data() {
		return {
			is_wechat: false,
			merchantId: 0,
			merchant: {},
			enablePlatform: [],
			platforms: [],
		}
	},
	onLoad(options) {
		if (isWeChatBrowser()) {
			this.is_wechat = true
			return
		}

		const infoStore = useInfoStore();

		if (options.licenseKey) {
			infoStore.setLicenseKey(options.licenseKey);
		}

		this.$http.get('/pengyipeng/user-app/api/getMerchantIdByLicenseKey', {
			licenseKey: options.licenseKey,
		}).then(aa => {
			this.merchantId = aa.result
			infoStore.setMerchantId(this.merchantId)

			this.$http.get('/pengyipeng/user-app/api/merchantQueryById', { merchantId: this.merchantId }).then(res => {
				this.merchant = res.result
				infoStore.setMerchant(this.merchant);
			})
			this.$http.get('/pengyipeng/user-app/api/getPypUsedPlatform').then(res => {
				this.platforms = res.result
			})
			this.$http.get('/pengyipeng/user-app/api/getEnablePlatform', { merchantId: this.merchantId }).then(res => {
				this.enablePlatform = res.result
			})
			this.$http.post('/pengyipeng/user-app/api/uploadClickData', {
				merchantId: this.merchantId,
			}, {
				'Content-Type': 'application/x-www-form-urlencoded'
			})
			this.$http.get("/pengyipeng/user-app/api/getAllTagList", {
				merchantId:this.merchantId
			}).then(res=>{
				infoStore.setAllKeywords(res.result);   // 设置店铺标签
			});
		})

	},
	methods: {
		toSelect(item) {
			if (item.name == 'wechat') {
				uni.showLoading({
					title: '加载中'
				})
				// this.$http.get('/pengyipeng/user-app/api/getMerchantWechatQrCode',{
				// 	merchantId: this.merchantId,
				// }).then(res => {
				// 	uni.previewImage({
				// 		urls: [res.result]
				// 	})
				// }).finally(() => {
				// 	uni.hideLoading({})
				// })

				this.$http.post('/pengyipeng/user-app/api/uploadClickData', {
					merchantId: this.merchantId,
					clickPlatformId: item.id,
				}, {
					'Content-Type': 'application/x-www-form-urlencoded'
				}).then(res => {
					location.href = 'weixin://dl/business/?env_version=trial&appid=wx2d666761d42f5595&path=pages/qr_code/qr_code&query=' + encodeURIComponent('merchantId=' + this.merchantId)
					// location.href = 'weixin://dl/business/?appid=wx2d666761d42f5595&path=pages/qr_code/qr_code&query=' + encodeURIComponent('merchantId=' + this.merchantId)
				})

				return
			}
			if (['dazhong_tuan', 'douyin_tuan', 'meituan_tuan',].indexOf(item.name) != -1) {

				this.$http.get('/pengyipeng/user-app/api/getShortLinkInfo', {
					merchantId: this.merchantId,
					platformName: item.name.replace("_tuan", ""),
				}).then(res => {
					location.href = res.result.parseInfo
				})

				return
			}
			uni.navigateTo({
				url: '/pages/select/select?id=' + this.merchantId + '&item=' + JSON.stringify(item)
			})
		},
		connectionWifi() {
			this.$http.post('/pengyipeng/user-app/api/uploadClickData', {
				merchantId: this.merchantId,
				clickWifi: 1,
			}, {
				'Content-Type': 'application/x-www-form-urlencoded'
			})
			location.href = 'weixin://dl/business/?env_version=trial&appid=wx2d666761d42f5595&path=pages/wifi/wifi&query=' + encodeURIComponent('wifiName=' + this.merchant.wifiUser + '&wifiPwd=' + this.merchant.wifiPwd)
			// location.href = 'weixin://dl/business/?appid=wx2d666761d42f5595&path=pages/wifi/wifi&query=' + encodeURIComponent('wifiName=' + this.merchant.wifiUser + '&wifiPwd=' + this.merchant.wifiPwd)
		}
	}
}
</script>

<style scoped lang="scss">
.dir {
	border-bottom: 1px solid #E5E0D3;
	padding: 0 20px;
	margin: 0 -20px;
}

.tag-dir {

	padding-bottom: 12px;

}

.tag {
	background: #F9EBC6;
	color: #666666;
	font-size: 12px;
	margin-right: 10px;
	padding: 2px 4px;
}

.list-1 {
	padding-bottom: 25px;

	.item {
		border-radius: 12px;
		box-shadow: 1px 3px 8px 0px rgba(216, 204, 167, 0.6);
	}
}

.list-3 {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 32px;
	margin: 0 12px;
	padding-top: 37px;

	.item {
		width: 100%;
		position: relative;

		.bg {
			width: 100%;
		}

		.icon {
			width: 49px;
			height: 49px;
		}

		.name {
			background: linear-gradient(270deg, #FE4C00 0%, #FF8200 100%);
			color: #FFF;
			font-size: 12px;
			padding: 4px 8px;
			border-radius: 50px;
			margin-top: 6px;
		}
	}
}
</style>

<template>
	<view class="bg-[#F5F5F5] !min-h-[100vh]">
		<image class="!w-full align-middle" src="@/static/Frame 70.png" mode="widthFix" />
		<div class="content bg-white !mx-[5.3%] !p-[10px]">
			<div class="flex items-center">
				<image class="!w-[12px] !h-[14px]" src="@/static/Vector-3.png" />
				<text class=" text-[15px] font-bold !ml-[4px]">推荐图片</text>
			</div>
			<div class="!grid grid-cols-3 gap-[7px] !mt-[10px]">
				<div class="aspect-[1/1] relative" v-for="(item, index) in packagePicList" :key="index">
					<image class="!w-full !h-full align-middle" :src="item" />
					<div class="z-10 !absolute !bottom-[10px] !right-[10px] !px-[5px] !py-[2px] !rounded-[5px] cursor-pointer text-red-500"
						@click="savePic(item, index)">
						保存
					</div>
				</div>
			</div>
			<div class="!flex justify-between items-center !mt-[9px] dir">
				<div class="!text-[12px]">
					<!-- <text>一键保存图片</text> -->
				</div>
				<div class="!text-[12px] text-[#FF8D2E]" @click="randomPic">
					<uni-icons type="loop" size="12" color="#FF8D2E"></uni-icons>
					<text>换一批</text>
				</div>
			</div>
			<div class="flex items-center !mt-[15px]">
				<image class="!w-[12px] !h-[14px]" src="@/static/Vector-3.png" />
				<text class=" text-[15px] font-bold !ml-[4px]">推荐文案</text>
			</div>
			<div class="bg-[#F5F5F5] rounded-[6px] !px-[13px] !py-[10px] !mt-[10px] overflow-y-auto min-h-[150px]">
				<div v-if="generatedContent" v-html="generatedContent"></div>
				<div v-else>加载中...</div>
				<span class=" float-right btn !py-[2px] !text-[12px] !px-[8px] !leading-5 !mt-[10px] !rounded-[5px]"
					@click="copyToClipboard">点击复制</span>
			</div>
			<div class="!flex gap-[15px] !mt-[50px] !mb-[11px]">
				<div class="btn" @click="generate">换一篇</div>
				<div class="btn fill" @click="copyToClipboardAndShare">复制文字发布</div>
			</div>
		</div>
	</view>
</template>

<script>
import { method } from 'lodash'

/**
 * 强制下载图片，避免在浏览器中打开
 * @param {string} url 图片地址
 * @param {string} filename 保存的文件名
 */
function forceDownloadImage(url, filename = 'image') {
	// 创建img元素加载图片
	const img = new Image();
	// 跨域设置
	img.crossOrigin = 'anonymous';

	img.onload = function () {
		// 创建画布绘制图片
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);

		// 将画布内容转为blob并创建下载链接
		canvas.toBlob(blob => {
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;

			document.body.appendChild(a);
			a.click();

			// 清理资源
			setTimeout(() => {
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}, 100);
		});
	};

	// 处理加载错误
	img.onerror = function () {
		console.error('图片加载失败，可能是跨域问题');
		// 尝试备选方案 - 直接下载
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.rel = 'noopener';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	img.src = url;
}

export default {
	data() {
		return {
			merchantId: '',
			packageId: '',
			packageInfo: {},
			packagePicList: [],
			generatedContent: '',
			promptCode: '',
			shortLinkInfo: {}
		}
	},
	onLoad(options) {
		this.merchantId = options.id
		this.packageId = options.packageId
		this.item = JSON.parse(options.item)
		this.tagIds =options.keywords;
		console.log("this.item:", this.item);
		this.$http.get('/pengyipeng/user-app/api/getPackageInfoIdsById', {
			packageId: this.packageId
		}).then(res => {
			res.result.packagePicList = JSON.parse(res.result.packagePicList)
			this.packageInfo = res.result
			this.randomPic()
		})
		this.$http.get('/pengyipeng/user-app/api/generateAiPrompt', {
			merchantId:this.merchantId,
			packageId: this.packageId,
			postPlatform: this.item.label,
			tagIdList: options.keywords,
			aiTokens: 200
		}).then(res => {
			this.promptCode = res.result.aiPrompt;
			this.packagePicList = res.result.picList;
			this.generate()
		})
		this.$http.get('/pengyipeng/user-app/api/getShortLinkInfo', {
			merchantId: this.merchantId,
			platformName: this.item.name,
		}).then(res => {
			this.shortLinkInfo = res.result
		})
	},
	methods: {
		savePic(item, index) {
			forceDownloadImage(item, 'image' + index + '.jpg')
		},
		generate() {
			this.generatedContent = ''
			uni.showLoading({
				title: '正在生成文案'
			})
			const task = uni.request({
				url: '/pengyipeng/user-app/api/ai/stream',
				method: 'GET',
				data: {
					question: this.promptCode
				},
				enableChunked: true,
				complete: () => {
					uni.hideLoading({})
				}
			})

			task.onChunkReceived((a) => {
				const decoder = new TextDecoder('utf-8')
				const text = decoder.decode(a.data)
				// console.log(text)
				this.generatedContent += text.replace(/data:|\n/g, '')
			})
			// this.$http.get('/pengyipeng/user-app/api/ai/generate', {
			// 	question: this.promptCode
			// }).then(res => {
			// 	this.generatedContent = res.result
			// }).finally(() => {
			// 	uni.hideLoading({})
			// })
		},
		copyToClipboard() {
			uni.setClipboardData({
				data: this.generatedContent.replace(/<br\/>/g, '\n'),
				success: () => {
					uni.showToast({
						title: '复制成功',
						icon: 'success'
					})
				}
			})
		},
		copyToClipboardAndShare() {

			

			uni.setClipboardData({
				data: this.generatedContent.replace(/<br\/>/g, '\n'),
				success: () => {
					uni.showToast({
						title: '复制成功',
						icon: 'success'
					})

					if (this.item.name == 'xiaohongshu') {
						location.href = 'xhsdiscover://post_note'
						return
					}

					this.$http.post('/pengyipeng/user-app/api/uploadClickData', {
						merchantId: this.merchantId,
						clickPlatformId: this.item.id,
					}, {
						'Content-Type': 'application/x-www-form-urlencoded'
					}).then(res => {
						location.href = this.shortLinkInfo.parseInfo
					})

					// xhs.share({
					// 	shareInfo: {
					// 		type: ' ', // 必填，笔记类型 'video' | 'normal'
					// 		title: ' ', // 笔记标题
					// 		content: ' ', // 笔记正文
					// 		images: [], //图文类型必填，笔记图片，必须是服务器地址，暂时不支持本地文件
					// 		video: ' ', // 视频类型必填，必须是服务器地址
					// 		cover: ' ' // 视频封面图，必须是服务器地址，暂时不支持本地文件
					// 	},
					// 	verifyConfig: {
					// 		appKey: ' ', //必填，应用的唯一标识,
					// 		nonce: ' ', // 必填，服务端生成签名的随机字符串
					// 		timestamp: ' ', // 必填，服务端生成签名的时间戳
					// 		signature: ' ', // 必填，服务端生成的签名
					// 	},
					// 	fail: (e) => {
					// 		// 调用失败时执行的回调函数
					// 	},
					// })
				}
			})
		},
		randomPic() {
			// // 随机从 this.packageInfo.packagePicList 取3张图片到 packagePicList 中
			// if (this.packageInfo.packagePicList && this.packageInfo.packagePicList.length > 0) {
			// 	const allPics = [...this.packageInfo.packagePicList];
			// 	const selectedPics = [];
			// 	const count = Math.min(3, allPics.length);

			// 	for (let i = 0; i < count; i++) {
			// 		const randomIndex = Math.floor(Math.random() * allPics.length);
			// 		// 避免重复
			// 		if (selectedPics.includes(allPics[randomIndex])) {
			// 			continue
			// 		}
			// 		selectedPics.push(allPics[randomIndex]);
			// 		allPics.splice(randomIndex, 1);
			// 	}

			// 	this.packagePicList = selectedPics;
			// }
			this.$http.get("/pengyipeng/user-app/api/changePicList", {
				merchantId:this.merchantId,
				tagIdList:this.tagIds,
				packageId:this.packageId,
			}).then(res=>{
				this.packagePicList = res.result
			})
		},
	},
}
</script>

<style scoped lang="scss">
.content {
	border-radius: 0 0 10px 10px;
}

.dir {
	border-bottom: 1px dashed #CCC;
	margin: 0 -10px;
	padding: 0 10px 10px;
}

.btn {
	border: 1px solid #FF7300;
	border-radius: 50px;
	background: #FFECDC;
	font-size: 14px;
	color: #FF7300;
	flex: 1;
	text-align: center;
	line-height: 40px;

	&.fill {
		background: #FF7300;
		color: #FFF;
	}
}
</style>
<template>
	<view class="bg-[#FFFCF4] p-[20px] !min-h-[100vh]">
		<image class="!w-[calc(100%-40px)] !mx-[20px]" src="@/static/Group 47.png" mode="widthFix"></image>
		<view class="box">
			<view class="content">
				<view>
					<image src="@/static/Vector.png" class="!w-[11px] !h-[11px]"></image>
					<text class="!ml-[5px] text-[15px] font-bold">套餐类型</text>
				</view>
				<view class="!grid grid-cols-2 gap-x-[20px] gap-y-[15px] !mt-[15px] list">
					<view class="item" v-for="(item, index) in list1" :key="index" @click="index1 = index"
						:class="{ 'active': index1 == index }">
						<text>{{ item.packageName }}</text>
						<uni-icons v-if="index1 == index" class="!absolute !-bottom-[6px] !-right-[0px]"
							type="checkbox-filled" size="20" color="#FF7300"></uni-icons>
					</view>
				</view>
			</view>
		</view>
		<div class="box">
			<div class="content">
				<view>
					<image src="@/static/Vector-1.png" class="!w-[11px] !h-[11px]"></image>
					<text class="!ml-[5px] text-[15px] font-bold">店铺关键词</text>
				</view>
				<view class="!grid grid-cols-2 gap-x-[20px] gap-y-[15px] !mt-[15px] list">
					<view class="item" v-for="(item, index) in list2" :key="item.name"
						@click="handleKeywordClick(index)" :class="{ 'active': index2.includes(index) }">
						<text>{{ item.name }}</text>
						<uni-icons v-if="index2.includes(index)" class="!absolute !-bottom-[6px] !-right-[0px]"
							type="checkbox-filled" size="20" color="#FF7300"></uni-icons>
					</view>
				</view>
			</div>
		</div>
		<div class="bg-[#FF7300] text-white text-center leading-[40px] rounded-[40px] !mx-[12px] !mt-[40px]"
			@click="toResult">
			<text>生成文案</text>
		</div>
	</view>
</template>

<script>
import { useInfoStore } from '@/store/info';

// import request from '@/util/request'

// export function generateContent(data) {
//   return request({
//     url: '/ypyagent/ai/generate',
//     method: 'post',
//     data
//   })
// }

export default {
	data() {
		return {
			id: '',
			list1: [],
			index1: 0,
			list2: [],
			index2: [0],
		}
	},
	onLoad(options) {
		this.id = options.id
		this.item = options.item
		this.$http.get('/pengyipeng/user-app/api/getPackagesByMerchantId', {
			merchantId: this.id
		}).then(res => {
			this.list1 = res.result
		})
		const infoStore = useInfoStore();
		this.list2 = infoStore.allKeywords.map(item=>{
			return { name: item.tagName, id:item.id, classificationMiddleId:item.classificationMiddleId }
		})
	},
	methods: {
		toResult() {
			// const selectedPackage = this.list1[this.index1].name;
			// const selectedKeywords = this.index2.map(index => this.list2[index].name);

			const selectedPackageId = this.list1[this.index1].id
			const selectedTagIds = this.index2.map(index => this.list2[index].id).join(',');
			uni.navigateTo({
				url: '/pages/result/result?id=' + this.id + '&packageId=' + selectedPackageId + '&item=' + this.item + '&keywords=' + selectedTagIds
			})

			// generateContent({
			// 	maxTokens:350,
			// 	topP:0.8,
			// 	temperature:0.5,
			// 	mode:"fast",
			// 	tone: "积极",
			// 	prompt: `帮我生成一个 ${selectedPackage}美食或者店铺评论，关键词：${selectedKeywords}`
			// }).then(res => {
			//     uni.setStorageSync('generatedContent', res.data);
			//     uni.navigateTo({
			//         url: '/pages/result/result'
			//     })
			// }).catch(err => {
			//     console.error('生成内容失败:', err);
			//     uni.showToast({
			//         title: '生成内容失败，请重试',
			//         icon: 'none'
			//     })
			// })
		},
		handleKeywordClick(index) {
			const i = this.index2.indexOf(index)
			if (i > -1) {
				this.index2.splice(i, 1)
			} else if (this.index2.length < 5) {
				this.index2.push(index)
			} else {
				uni.showToast({
					title: '最多选择5个关键词',
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style scoped lang="scss">
.box {
	margin: 0 -15px;
	border-image-source: url("@/static/Group 48.png");
	border-width: 80px 230px 35px 35px;
	border-style: solid;
	border-image-slice: 80 230 35 35 fill;

	.content {
		margin-top: -53px;
		margin-left: -5px;
		margin-right: -200px;
		margin-bottom: -4px;
	}

	.list {
		.item {
			box-shadow: 0px 1px 8px 0px rgba(184, 195, 206, 0.6);
			padding: 10px;
			border-radius: 6px;
			position: relative;

			&.active {
				box-shadow: none;
				background: linear-gradient(90deg, #FFDBA0 0%, #FFF4E2 100%);
			}
		}
	}
}
</style>

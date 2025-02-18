<script setup lang="ts" generic="T">
import { ref, computed, useTemplateRef } from 'vue'

interface Props {
	items: T[]
	itemHeight: number
	containerHeight: number
	is?: 'ul' | 'ol' | 'div' | 'section'
}

const { items = [], itemHeight = 40, containerHeight = 200, is = 'ul' } = defineProps<Props>()

const container = useTemplateRef('container')
const scrollTop = ref(0)

function onScroll(e: Event) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	scrollTop.value = e?.target?.scrollTop
}

const OVERSCAN = 10
const startIndex = computed(() => Math.floor(scrollTop.value / itemHeight))
const visibleCount = computed(() => Math.ceil(containerHeight / itemHeight))

const visibleItems = computed(() =>
	items.slice(
		Math.max(0, startIndex.value - OVERSCAN),
		Math.min(items.length, startIndex.value + visibleCount.value + OVERSCAN),
	),
)

const totalHeight = computed(() => items.length * itemHeight)

function getItemStyle(index: number) {
	return {
		position: 'absolute',
		top: index * itemHeight + 'px',
		height: itemHeight + 'px',
		width: '100%',
		boxSizing: 'border-box',
		padding: '5px',
		borderBottom: '1px solid #eee',
	}
}
</script>

<template>
	<Component
		:is="is"
		ref="container"
		class="border-[1px] border-gray-300"
		:style="{ height: containerHeight + 'px', overflowY: 'auto' }"
		@scroll="onScroll"
	>
		<div :style="{ height: totalHeight + 'px', position: 'relative' }">
			<div
				v-for="(item, index) in visibleItems"
				:key="startIndex + index"
				:style="getItemStyle(startIndex + index)"
				class="bg-gray-200"
			>
				<slot :item="item" :index="index" />
			</div>
		</div>
	</Component>
</template>

import { defineComponent, ref, computed, defineSlots } from 'vue'
import type { PropType, CSSProperties } from 'vue'

type ValidTags = 'ul' | 'ol' | 'div' | 'section'

export default defineComponent({
	props: {
		items: { type: Array as PropType<string[]>, default: () => [] },
		itemHeight: { type: Number, default: 40 },
		containerHeight: { type: Number, default: 200 },
		is: { type: String as PropType<ValidTags>, default: 'ul' },
	},
	setup(props) {
		const slots = defineSlots<{
			default(props: { item: unknown; index: number }): never
		}>()

		const scrollTop = ref(0)

		function onScroll(e: Event) {
			scrollTop.value = (e.target as HTMLElement)?.scrollTop || 0
		}

		const OVERSCAN = 10
		const startIndex = computed(() => Math.floor(scrollTop.value / props.itemHeight))
		const visibleCount = computed(() => Math.ceil(props.containerHeight / props.itemHeight))

		const visibleItems = computed(() =>
			props.items.slice(
				Math.max(0, startIndex.value - OVERSCAN),
				Math.min(props.items.length, startIndex.value + visibleCount.value + OVERSCAN),
			),
		)

		const totalHeight = computed(() => props.items.length * props.itemHeight)

		function getItemStyle(index: number): CSSProperties {
			return {
				position: 'absolute',
				top: `${index * props.itemHeight}px`,
				height: `${props.itemHeight}px`,
				width: '100%',
				boxSizing: 'border-box',
				padding: '5px',
				borderBottom: '1px solid #eee',
			}
		}
		const Tag = props.is || 'ul'

		return () => (
			<Tag
				class="border border-gray-300"
				style={{ height: `${props.containerHeight}px`, overflowY: 'auto' }}
				onScroll={onScroll}
			>
				<div style={{ height: `${totalHeight.value}px`, position: 'relative' }}>
					{visibleItems.value.map((item: unknown, index: number) => (
						<div
							key={startIndex.value + index}
							style={getItemStyle(startIndex.value + index)}
							class="bg-gray-200"
						>
							{slots?.default({ item, index })}
						</div>
					))}
				</div>
			</Tag>
		)
	},
})

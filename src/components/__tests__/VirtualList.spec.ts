import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, it, expect } from 'vitest'
import VirtualList from '@/components/virtual-list/VirtualList.vue'

describe('VirtualList Component', () => {
	it('renders correct number of visible items initially', async () => {
		const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`)
		const wrapper = mount(VirtualList, {
			props: {
				items,
				itemHeight: 40,
				containerHeight: 200,
			},
			slots: {
				default: `<template #default="{ item }">
                    <span class="item-text">{{ item }}</span>
                  </template>`,
			},
		})
		await nextTick()

		// Find the container (it has a class with border styling)
		const container = wrapper.find('.border-gray-300')
		expect(container.exists()).toBe(true)

		// The inner div has a style with the total height calculated as items.length * itemHeight
		const innerContainer = container.find('div')
		expect(innerContainer.attributes('style')).toContain('height: 4000px')

		// Initially, scrollTop is 0 so:
		//   startIndex = Math.floor(0/40) = 0
		//   visibleCount = Math.ceil(200/40) = 5
		//   With OVERSCAN = 10, we expect items.slice(0, 0 + 5 + 10) = 15 items.
		const visibleItems = innerContainer.findAll('div.bg-gray-200')
		expect(visibleItems.length).toBe(15)
	})

	it('updates visible items on scroll', async () => {
		const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`)
		const wrapper = mount(VirtualList, {
			props: {
				items,
				itemHeight: 40,
				containerHeight: 200,
			},
			slots: {
				default: `<template #default="{ item }">
                    <span class="item-text">{{ item }}</span>
                  </template>`,
			},
		})
		await nextTick()

		const container = wrapper.find('.border-gray-300')
		const containerEl = container.element as HTMLElement

		// Simulate a scroll event: set scrollTop = 80 pixels.
		// With itemHeight=40, startIndex becomes Math.floor(80/40) = 2.
		// visibleCount remains 5, so visible items come from items.slice(max(0,2-10), 2+5+10) = items.slice(0, 17)
		Object.defineProperty(containerEl, 'scrollTop', { value: 80, writable: true })
		await container.trigger('scroll')
		await nextTick()

		const innerContainer = container.find('div')
		const visibleItems = innerContainer.findAll('div.bg-gray-200')
		expect(visibleItems.length).toBe(17)
	})

	it('applies correct inline styles to visible items', async () => {
		const items = Array.from({ length: 20 }, (_, i) => `Item ${i}`)
		const wrapper = mount(VirtualList, {
			props: {
				items,
				itemHeight: 40,
				containerHeight: 200,
			},
			slots: {
				default: `<template #default="{ item }">
                    <span class="item-text">{{ item }}</span>
                  </template>`,
			},
		})
		await nextTick()

		const container = wrapper.find('.border-gray-300')
		const innerContainer = container.find('div')
		const firstItem = innerContainer.find('div.bg-gray-200')
		const style = firstItem.attributes('style')

		// Check that the style includes the expected properties
		expect(style).toContain('position: absolute')
		expect(style).toContain('top: 0px') // first item should be at top 0
		expect(style).toContain('height: 40px')
		expect(style).toContain('width: 100%')
		expect(style).toContain('box-sizing: border-box')
		expect(style).toContain('padding: 5px')
		expect(style).toContain('border-bottom: 1px solid #eee')
	})

	it('renders correct container element based on the "is" prop', async () => {
		const items = ['Item 1', 'Item 2']
		const wrapper = mount(VirtualList, {
			props: {
				items,
				itemHeight: 40,
				containerHeight: 200,
				is: 'section',
			},
			slots: {
				default: `<template #default="{ item }">
                    <span class="item-text">{{ item }}</span>
                  </template>`,
			},
		})
		await nextTick()

		// Since we passed is="section", the container should render as a <section> element.
		const container = wrapper.find('section')
		expect(container.exists()).toBe(true)
	})
})

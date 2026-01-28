import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';

interface CrossPagerViewProps {
	initialPage?: number;
	onPageSelected?: (event: { nativeEvent: { position: number } }) => void;
	style?: ViewStyle;
	children: React.ReactNode;
}

export interface CrossPagerViewRef {
	setPage: (page: number) => void;
}

/**
 * Web-specific pager view component using ScrollView.
 */
export const CrossPagerView = forwardRef<CrossPagerViewRef, CrossPagerViewProps>(
	({ initialPage = 0, onPageSelected, style, children }, ref) => {
		const scrollViewRef = useRef<ScrollView>(null);
		const pageWidth = (style as { width?: number })?.width ?? 0;
		const currentPageRef = useRef(initialPage);

		useImperativeHandle(ref, () => ({
			setPage: (page: number) => {
				if (scrollViewRef.current && pageWidth > 0) {
					scrollViewRef.current.scrollTo({
						x: page * pageWidth,
						animated: true,
					});
				}
			},
		}));

		const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
			if (pageWidth <= 0) return;
			const offsetX = event.nativeEvent.contentOffset.x;
			const newPage = Math.round(offsetX / pageWidth);
			if (newPage !== currentPageRef.current) {
				currentPageRef.current = newPage;
				onPageSelected?.({ nativeEvent: { position: newPage } });
			}
		};

		return (
			<ScrollView
				ref={scrollViewRef}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				style={style}
				contentOffset={{ x: initialPage * pageWidth, y: 0 }}
				onScroll={handleScroll}
				scrollEventThrottle={16}
			>
				{React.Children.map(children, (child, index) => (
					<View key={index} style={{ width: pageWidth, height: '100%' }}>
						{child}
					</View>
				))}
			</ScrollView>
		);
	}
);

CrossPagerView.displayName = 'CrossPagerView';

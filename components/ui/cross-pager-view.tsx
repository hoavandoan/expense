import React, { forwardRef } from 'react';
import { type ViewStyle } from 'react-native';
import PagerView from 'react-native-pager-view';

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
 * Native-specific pager view component using react-native-pager-view.
 */
export const CrossPagerView = forwardRef<PagerView, CrossPagerViewProps>(
	({ initialPage = 0, onPageSelected, style, children }, ref) => {
		return (
			<PagerView
				ref={ref}
				style={style}
				initialPage={initialPage}
				onPageSelected={onPageSelected}
			>
				{children}
			</PagerView>
		);
	}
);

CrossPagerView.displayName = 'CrossPagerView';

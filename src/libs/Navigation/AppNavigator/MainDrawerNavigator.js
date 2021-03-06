import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {withOnyx} from 'react-native-onyx';

import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import styles, {getNavigationDrawerStyle, getNavigationDrawerType} from '../../../styles/styles';
import ONYXKEYS from '../../../ONYXKEYS';
import compose from '../../compose';
import SCREENS from '../../../SCREENS';

// Screens
import SidebarScreen from '../../../pages/home/sidebar/SidebarScreen';
import ReportScreen from '../../../pages/home/ReportScreen';
import {findLastAccessedReport} from '../../reportUtils';

const propTypes = {
    /** Available reports that would be displayed in this navigator */
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    reports: {},
};

const Drawer = createDrawerNavigator();

const getInitialReportScreenParams = (reports) => {
    const last = findLastAccessedReport(reports);

    // Fallback to empty if for some reason reportID cannot be derived - prevents the app from crashing
    const reportID = lodashGet(last, 'reportID', '');
    return {reportID: String(reportID)};
};

const MainDrawerNavigator = (props) => {
    const initialParams = getInitialReportScreenParams(props.reports);

    // Wait until reports are fetched and there is a reportID in initialParams
    if (!initialParams.reportID) {
        return <FullScreenLoadingIndicator visible />;
    }

    // After the app initializes and reports are available the home navigation is mounted
    // This way routing information is updated (if needed) based on the initial report ID resolved.
    // This is usually needed after login/create account and re-launches
    return (
        <Drawer.Navigator
            defaultStatus={props.isSmallScreenWidth ? 'open' : 'closed'}
            sceneContainerStyle={styles.navigationSceneContainer}
            drawerContent={() => <SidebarScreen />}
            screenOptions={{
                cardStyle: styles.navigationScreenCardStyle,
                headerShown: false,
                drawerType: getNavigationDrawerType(props.isSmallScreenWidth),
                drawerStyle: getNavigationDrawerStyle(
                    props.windowWidth,
                    props.windowHeight,
                    props.isSmallScreenWidth,
                ),
                swipeEdgeWidth: 500,
            }}
        >
            <Drawer.Screen
                name={SCREENS.REPORT}
                component={ReportScreen}
                initialParams={initialParams}
            />
        </Drawer.Navigator>
    );
};

MainDrawerNavigator.propTypes = propTypes;
MainDrawerNavigator.defaultProps = defaultProps;
MainDrawerNavigator.displayName = 'MainDrawerNavigator';

export default compose(
    withWindowDimensions,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
    }),
)(MainDrawerNavigator);
export {getInitialReportScreenParams};

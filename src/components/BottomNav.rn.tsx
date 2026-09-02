import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../store/hooks';
import { useTranslation } from '../hooks/useTranslation';

interface NavItem {
    name: string;
    icon: string;
    label: string;
    badge?: number;
}

const BottomNav: React.FC<any> = ({ state, descriptors, navigation: tabNavigation }) => {
    const navigation = useNavigation();
    const route = useRoute();
    const { bottom } = useSafeAreaInsets();
    const darkMode = useAppSelector((s) => s.theme.darkMode);
    const totalJobsCount = useAppSelector((s) => s.jobs.totalJobsCount);
    const totalBlogsCount = useAppSelector((s) => s.blog.totalBlogsCount);
    const t = useTranslation();

    const navItems: NavItem[] = [
        { name: 'HomeFinal', icon: 'home', label: t.nav.home },
        { name: 'JobListings', icon: 'briefcase', label: 'Jobs', badge: totalJobsCount },
        { name: 'Blog', icon: 'reader', label: t.nav.blog, badge: totalBlogsCount },
        { name: 'Pricing', icon: 'pricetag', label: t.nav.pricing },
        { name: 'FAQ', icon: 'help-circle', label: t.nav.faq },
        { name: 'ContactUs', icon: 'mail', label: t.nav.contact },
    ];

    const navigate = (screen: string) => {
        if (tabNavigation) {
            tabNavigation.navigate(screen);
        } else {
            navigation.navigate(screen as never);
        }
    };

    // Helper to determine active index
    const getActiveRouteName = () => {
        if (state) return state.routes[state.index].name;
        return route.name;
    };

    const activeRouteName = getActiveRouteName();

    return (
        <View style={[
            styles.safeArea,
            darkMode && styles.safeAreaDark,
        ]}>
            <View style={[
                styles.floatingContainer,
                darkMode && styles.floatingContainerDark,
                {
                    paddingBottom: 2,
                    marginBottom: Math.max(bottom, 24)
                }
            ]}>
                <View style={[styles.container, darkMode && styles.containerDark]}>
                    {navItems.map((item) => {
                        const isActive = activeRouteName === item.name;
                        return (
                            <TouchableOpacity
                                key={item.name}
                                style={styles.navItem}
                                onPress={() => navigate(item.name)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.iconContainer}>
                                    <Ionicons
                                        name={item.icon as any}
                                        size={26}
                                        color={isActive ? '#06b6d4' : (darkMode ? '#b1b1b1' : '#8e8e93')}
                                    />
                                    {item.badge != null && item.badge > 0 && (
                                        <View style={[styles.badge, darkMode && styles.badgeDark]}>
                                            <Text style={styles.badgeText}>
                                                {item.badge > 99 ? '99+' : item.badge}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text
                                    style={[
                                        styles.label,
                                        darkMode && styles.labelDark,
                                        isActive && styles.activeLabel,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        width: '100%',
        backgroundColor: 'transparent',
        ...Platform.select({
            web: {
                position: 'absolute' as const,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
            },
            default: {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
            },
        }),
    },
    safeAreaDark: {
        backgroundColor: 'transparent',
    },
    floatingContainer: {
        marginHorizontal: 12,
        borderRadius: 50,
        backgroundColor: 'rgba(240, 240, 245, 0.95)',
        borderWidth: 0,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
            },
            android: {
                elevation: 12,
            },
            web: {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            },
        }),
    },
    floatingContainerDark: {
        backgroundColor: 'rgba(20, 20, 22, 0.95)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
            },
            android: {
                elevation: 12,
            },
            web: {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            },
        }),
    },
    container: {
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 4,
        paddingHorizontal: 12,
        backgroundColor: 'transparent',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        borderRadius: 50,
    },
    containerDark: {
        backgroundColor: 'transparent',
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 3,
    },
    iconContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 3,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -12,
        backgroundColor: '#06b6d4',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#ffffff',
    },
    badgeDark: {
        borderColor: 'rgba(28, 28, 30, 0.9)',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    label: {
        fontSize: 11,
        marginTop: 3,
        color: '#8e8e93',
        fontWeight: '400',
    },
    labelDark: {
        color: '#b1b1b1',
    },
    activeLabel: {
        color: '#06b6d4',
        fontWeight: '500',
    },
});

export default BottomNav;

import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Image,
    StatusBar,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling function
const scale = (size) => (SCREEN_WIDTH / 375) * size;

// Define Theme Colors
const THEME_COLOR = '#2E8B57';
const TEXT_DARK = '#1F2937';
const TEXT_LIGHT = '#6B7280';
const TEXT_LIGHTER = '#636363ff';

const ONBOARDING_DATA = [
    {
        id: 1,
        title: 'Fresh Groceries',
        subtitle: '& Organic Food',
        description: 'Get affordable organic vegetables, fruits,and more directly from local farmers.',
        image: require('../../assets/vegiee1.png'),
        bgColor: '#F2F9F5',
    },
    {
        id: 2,
        title: 'Easy Ordering',
        subtitle: 'In Few Clicks',
        description: 'Browse through a wide variety of fresh items and place your order in seconds.',
        image: require('../../assets/ordering.png'),
        bgColor: '#FFF8F0',
    },
    {
        id: 3,
        title: 'Fast Delivery',
        subtitle: 'Right to Doorstep',
        description: 'Get your fresh organic groceries delivered safely to your home in record time.',
        image: require('../../assets/delivery.png'),
        bgColor: '#F0F7FF',
    },
    {
        id: 4,
        title: 'Support Farmers',
        subtitle: 'Grow Community',
        description: 'Your purchases directly support local farmers and encourage sustainable agriculture.',
        image: require('../../assets/farmers.png'),
        bgColor: '#FFFCF2',
    },
];

const OnboardingScreen = () => {
    const navigation = useNavigation();
    const scrollViewRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    // Interpolate Background Color for the whole screen
    const backgroundColor = scrollX.interpolate({
        inputRange: ONBOARDING_DATA.map((_, i) => i * SCREEN_WIDTH),
        outputRange: ONBOARDING_DATA.map((item) => item.bgColor),
    });

    const handleNext = () => {
        // Button press animation
        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        if (currentIndex < ONBOARDING_DATA.length - 1) {
            const nextIndex = currentIndex + 1;
            scrollViewRef.current?.scrollTo({
                x: nextIndex * SCREEN_WIDTH,
                animated: true,
            });
            setCurrentIndex(nextIndex);
        } else {
            handleFinish();
        }
    };

    const handleSkip = () => {
        handleFinish();
    };

    const handleFinish = async () => {
        try {
            await AsyncStorage.setItem('@onboarding_completed', 'true');
            navigation.replace('Login');
        } catch (error) {
            console.error('Error saving onboarding status:', error);
            navigation.replace('Login');
        }
    };

    const handleScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentIndex(index);
    };

    const renderPagination = () => {
        return (
            <View style={styles.paginationContainer}>
                {ONBOARDING_DATA.map((_, index) => {
                    const inputRange = [
                        (index - 1) * SCREEN_WIDTH,
                        index * SCREEN_WIDTH,
                        (index + 1) * SCREEN_WIDTH,
                    ];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 24, 8],
                        extrapolate: 'clamp',
                    });

                    const dotOpacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.paginationDot,
                                {
                                    width: dotWidth,
                                    opacity: dotOpacity,
                                    backgroundColor: THEME_COLOR,
                                },
                            ]}
                        />
                    );
                })}
            </View>
        );
    };

    const renderOnboardingItem = (item, index) => {
        const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
        ];

        // Parallax effect for image
        const imageTranslateY = scrollX.interpolate({
            inputRange,
            outputRange: [100, 0, 100],
            extrapolate: 'clamp',
        });

        const imageScale = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
        });

        // Text fade in/out
        const textOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
        });

        const textTranslateY = scrollX.interpolate({
            inputRange,
            outputRange: [50, 0, 50],
            extrapolate: 'clamp',
        });

        return (
            <View key={item.id} style={styles.slide}>
                {/* Image Section */}
                <View style={styles.imageContainer}>
                    {/* Decorative Circle Background */}
                    <Animated.Image
                        source={item.image}
                        style={[
                            styles.image,
                            {
                                transform: [
                                    { scale: imageScale },
                                    { translateY: imageTranslateY }
                                ]
                            }
                        ]}
                        resizeMode="contain"
                    />
                </View>

                {/* Content Section */}
                <Animated.View
                    style={[
                        styles.textContainer,
                        {
                            opacity: textOpacity,
                            transform: [{ translateY: textTranslateY }]
                        }
                    ]}
                >
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </Animated.View>
            </View>
        );
    };

    return (
        <Animated.View style={[styles.container, { backgroundColor }]}>
            <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />

            {/* Header - Logo & Skip */}
            <View style={styles.header}>
                <Image
                    source={require('../../assets/logo1.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                {currentIndex < ONBOARDING_DATA.length - 1 && (
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Scrollable Content */}
            <Animated.ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false, listener: handleScroll }
                )}
                scrollEventThrottle={16}
                style={styles.scrollView}
            >
                {ONBOARDING_DATA.map((item, index) => renderOnboardingItem(item, index))}
            </Animated.ScrollView>

            {/* Footer - Pagination & Button */}
            <View style={styles.footer}>
                {renderPagination()}

                <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={handleNext}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.nextButtonText}>
                            {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingHorizontal: scale(24),
        zIndex: 10,
    },
    logo: {
        width: scale(150),
        height: scale(40),
    },
    skipButton: {
        borderColor: '#F1F5F9',
        borderWidth: 1.5,
        borderRadius: scale(14),
        paddingHorizontal: scale(19),
        paddingVertical: scale(7),
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    skipText: {
        fontSize: scale(14),
        fontWeight: '600',
        color: TEXT_LIGHTER,
        letterSpacing: 0.3,
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        width: SCREEN_WIDTH,
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: scale(-16),
    },
    image: {
        width: SCREEN_WIDTH * 0.75,
        height: SCREEN_WIDTH * 0.75,
        zIndex: 2,
        borderRadius: 16,
    },
    textContainer: {
        paddingHorizontal: scale(32),
        alignItems: 'center',
        marginTop: scale(-8),
    },
    title: {
        fontSize: scale(26),
        fontWeight: '700',
        color: TEXT_DARK,
        textAlign: 'center',
        marginBottom: scale(5),
    },
    subtitle: {
        fontSize: scale(18),
        fontWeight: '600',
        color: THEME_COLOR,
        textAlign: 'center',
        marginBottom: scale(20),
    },
    description: {
        fontSize: scale(16),
        lineHeight: scale(24),
        color: TEXT_LIGHT,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    },
    footer: {
        paddingHorizontal: scale(24),
        paddingBottom: scale(40),
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: SCREEN_HEIGHT * 0.2,
    },
    paginationContainer: {
        flexDirection: 'row',
        marginBottom: scale(30),
    },
    paginationDot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    nextButton: {
        backgroundColor: THEME_COLOR,
        borderRadius: scale(18),
        height: scale(50),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        shadowColor: THEME_COLOR,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    nextButtonText: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginRight: scale(8),
    },
});

export default OnboardingScreen;
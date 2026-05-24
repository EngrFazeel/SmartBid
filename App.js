import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import SplashScreen from './src/screen/SplashScreen';
import OnboardingScreen from './src/screen/OnboardingScreen';
import LoginScreen from './src/screen/LoginScreen';
import AdminPanelScreen from './src/screen/AdminPanelScreen';
import HomeScreen from './src/screen/HomeScreen';
import ElectronicsCategoryScreen from './src/screen/ElectronicsCategoryScreen';
import ArtCollectiblesCategoryScreen from './src/screen/ArtCollectiblesCategoryScreen';
import VehiclesCategoryScreen from './src/screen/VehiclesCategoryScreen';
import ProductDetailScreen from './src/screen/ProductDetailScreen';
import BidsScreen from './src/screen/BidsScreen';
import ProfileScreen from './src/screen/ProfileScreen';
import AddProductScreen from './src/screen/AddProductScreen';
import { auth } from './src/config/firebaseConfig';
import { UserProvider, useUser } from './src/context/UserContext';
import SettingsScreen from './src/components/SettingsScreen';
import PaymentMethodsScreen from './src/components/PaymentMethodsScreen';
import FavoritesScreen from './src/components/FavoritesScreen';
import PrivacyPolicyScreen from './src/components/PrivacyPolicyScreen';
import HelpSupportScreen from './src/components/HelpSupportScreen';
import AddPaymentMethodScreen from './src/components/AddPaymentMethodScreen';
import AddFundsScreen from './src/components/AddFundsScreen';
import WithdrawFundsScreen from './src/components/WithdrawFundsScreen';
import TransactionHistoryScreen from './src/components/TransactionHistoryScreen';
import NotificationScreen from './src/components/NotificationScreen';
import SupportTicketsScreen from './src/components/SupportTicketsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack Navigator
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Electronics" component={ElectronicsCategoryScreen} />
      <Stack.Screen name="ArtCollectibles" component={ArtCollectiblesCategoryScreen} />
      <Stack.Screen name="Vehicles" component={VehiclesCategoryScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      {/* Add AddFunds screen to HomeStack for easy access from ProductDetail */}
      <Stack.Screen name="AddFunds" component={AddFundsScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
    </Stack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="SupportTickets" component={SupportTicketsScreen} />
      <Stack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} />
      <Stack.Screen name="AddFunds" component={AddFundsScreen} />
      <Stack.Screen name="WithdrawFunds" component={WithdrawFundsScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      
      

    </Stack.Navigator>
  );
}

// Bids Stack Navigator
function BidsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BidsMain" component={BidsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      {/* Add AddFunds screen to BidsStack as well */}
      <Stack.Screen name="AddFunds" component={AddFundsScreen} />
      
    </Stack.Navigator>
  );
}

// Admin Stack Navigator
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator with conditional Add Product tab
function MainTabs() {
  const { user } = useUser();
  
  // Check if user has seller role to show Add Product tab
  const showAddProductTab = user?.userRole === 'seller';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#290da5ff',
        tabBarInactiveTintColor: '#888',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bids"
        component={BidsStack}
        options={{
          tabBarLabel: 'Bids',
          tabBarIcon: ({ color, size }) => (
            <Icon name="trending-up" size={size} color={color} />
          ),
        }}
      />
      
      {/* Conditionally render Add Product tab based on user role */}
      {showAddProductTab && (
        <Tab.Screen
          name="AddProduct"
          component={AddProductScreen}
          options={{
            tabBarLabel: '',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.plusButton}>
                <Icon name="plus" size={24} color="#fff" />
              </View>
            ),
          }}
        />
      )}
      
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Storage keys
const STORAGE_KEYS = {
  HAS_COMPLETED_ONBOARDING: 'has_completed_onboarding',
  IS_LOGGED_IN: 'is_logged_in',
  IS_ADMIN: 'is_admin',
  USER_EMAIL: 'user_email',
  USER_ROLE: 'user_role',
};

// Main App Component
const App = () => {
  const [appState, setAppState] = useState('splash');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
      const storedIsAdmin = await AsyncStorage.getItem(STORAGE_KEYS.IS_ADMIN);
      const storedEmail = await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL);
      const storedUserRole = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
      
      console.log('Stored auth state:', { storedIsAdmin, storedEmail, storedUserRole });
      
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        console.log('Auth state changed - User:', user?.email);
        
        if (user) {
          // Check if user is admin based on email
          const isAdminUser = user.email === 'mateen3037@gmail.com';
          console.log('Is admin user:', isAdminUser);
          
          if (isAdminUser) {
            console.log('Admin user detected, redirecting to admin panel');
            await AsyncStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
            await AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, user.email);
            setAppState('admin');
          } else {
            console.log('Regular user detected, redirecting to main app');
            await AsyncStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'false');
            await AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, user.email || '');
            setAppState('main');
          }
          await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
        } else {
          console.log('No user found, checking onboarding state');
          if (hasCompletedOnboarding === 'true') {
            setAppState('login');
          } else {
            setAppState('onboarding');
          }
        }
        setIsCheckingAuth(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error checking auth state:', error);
      setAppState('onboarding');
      setIsCheckingAuth(false);
    }
  };

  const handleOnboardingFinish = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, 'true');
      setAppState('login');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      setAppState('login');
    }
  };

  const handleAuthSuccess = async (userEmail, userRole = 'buyer') => {
    try {
      console.log('Handling auth success for:', userEmail, 'with role:', userRole);
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      await AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, userEmail || '');
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, userRole || 'buyer');
      
      // Check if the logged-in user is admin
      if (userEmail === 'mateen3037@gmail.com') {
        console.log('Admin user detected, setting admin state');
        await AsyncStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
        setAppState('admin');
      } else {
        console.log('Regular user detected, setting regular state');
        await AsyncStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'false');
        setAppState('main');
      }
    } catch (error) {
      console.error('Error saving login state:', error);
      // Fallback based on email
      if (userEmail === 'mateen3037@gmail.com') {
        setAppState('admin');
      } else {
        setAppState('main');
      }
    }
  };

  const handleAdminLogout = async () => {
    try {
      console.log('Admin logout, clearing admin state');
      await AsyncStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'false');
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE);
      await auth.signOut();
      setAppState('login');
    } catch (error) {
      console.error('Error clearing admin state:', error);
      setAppState('login');
    }
  };

  const handleUserLogout = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'false');
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE);
      await auth.signOut();
      setAppState('login');
    } catch (error) {
      console.error('Error clearing user state:', error);
      setAppState('login');
    }
  };

  const renderAppState = () => {
    if (isCheckingAuth) {
      return <SplashScreen />;
    }

    console.log('Rendering app state:', appState);

    switch (appState) {
      case 'splash':
        return <SplashScreen />;
      case 'onboarding':
        return <OnboardingScreen onFinish={handleOnboardingFinish} />;
      case 'login':
        return (
          <LoginScreen 
            onAuthSuccess={handleAuthSuccess}
          />
        );
      case 'admin':
        return (
          <NavigationContainer>
            <AdminPanelScreen onLogout={handleAdminLogout} />
          </NavigationContainer>
        );
      case 'main':
        return (
          <NavigationContainer>
            <UserProvider onLogout={handleUserLogout}>
              <MainTabs />
            </UserProvider>
          </NavigationContainer>
        );
      default:
        return <SplashScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {renderAppState()}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // elevation: 5,
  },
});
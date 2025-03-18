import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, Bell, User, Shield, CircleHelp as HelpCircle, Info, Moon } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

const SettingsItem = ({ icon: Icon, title, subtitle, rightElement }: { 
  icon: any, 
  title: string, 
  subtitle?: string,
  rightElement?: React.ReactNode 
}) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.settingsItem, { backgroundColor: colors.surface }]} 
      activeOpacity={0.7}
    >
      <View style={[styles.settingsItemIcon, { backgroundColor: colors.searchBackground }]}>
        <Icon size={24} color={colors.text} />
      </View>
      <View style={styles.settingsItemContent}>
        <Text style={[styles.settingsItemTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingsItemSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {rightElement || <ChevronRight size={20} color={colors.textSecondary} />}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <ScrollView>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your app preferences</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          <SettingsItem 
            icon={User}
            title="Profile"
            subtitle="Edit your profile information"
          />
          <SettingsItem 
            icon={Bell}
            title="Notifications"
            subtitle="Manage your notifications"
          />
          <SettingsItem 
            icon={Shield}
            title="Privacy"
            subtitle="Control your privacy settings"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
          <SettingsItem 
            icon={Moon}
            title="Dark Mode"
            subtitle="Toggle dark mode on/off"
            rightElement={
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          <SettingsItem 
            icon={HelpCircle}
            title="Help Center"
            subtitle="Get help with the app"
          />
          <SettingsItem 
            icon={Info}
            title="About"
            subtitle="Version 1.0.0"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});
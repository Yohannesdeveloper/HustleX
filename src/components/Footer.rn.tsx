/**
 * React Native Footer Component
 * Reusable footer for all pages
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "../hooks/useTranslation";

const Footer: React.FC = () => {
  const navigation = useNavigation();
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const t = useTranslation();

  return (
    <View style={[styles.footer, darkMode && styles.footerDark]}>
      <View style={styles.footerContent}>
        {/* Footer Columns */}
        <View style={styles.footerGrid}>
          {/* For Clients */}
          <View style={styles.footerColumn}>
            <Text style={[styles.footerColumnTitle, darkMode && styles.footerColumnTitleDark]}>
              {t.footer.forClients}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('JobListings' as never)}>
              <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                {t.footer.howToHire}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('JobListings' as never)}>
              <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                {t.footer.talentMarketplace}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Pricing' as never)}>
              <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                {t.nav.pricing}
              </Text>
            </TouchableOpacity>
          </View>

          {/* For Freelancers */}
          <View style={styles.footerColumn}>
            <Text style={[styles.footerColumnTitle, darkMode && styles.footerColumnTitleDark]}>
              {t.footer.forFreelancers}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('JobListings' as never)}>
              <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                {t.footer.howToFindWork}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('JobListings' as never)}>
              <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                {t.footer.freelanceJobs}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                {t.footer.resources}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Company */}
          <View style={styles.footerColumn}>
            <Text style={[styles.footerColumnTitle, darkMode && styles.footerColumnTitleDark]}>
              {t.footer.company}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('AboutUs' as never)}>
              <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                {t.footer.aboutUs}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                {t.footer.careers}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ContactUs' as never)}>
              <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                {t.footer.contactUs}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Resources */}
          <View style={styles.footerColumn}>
            <Text style={[styles.footerColumnTitle, darkMode && styles.footerColumnTitleDark]}>
              {t.footer.resources}
            </Text>
            <TouchableOpacity>
              <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                {t.footer.helpCenter}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Blog' as never)}>
              <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                {t.footer.blog}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.footerLink, darkMode && styles.footerLinkDark]}>
                {t.footer.community}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Bottom */}
        <View style={styles.footerBottom}>
          <View style={styles.footerBottomLeft}>
            <Text style={[styles.footerCopyright, darkMode && styles.footerCopyrightDark]}>
              © 2025 HustleX. {t.footer.allRightsReserved}
            </Text>
            <Text style={[styles.footerMadeWith, darkMode && styles.footerMadeWithDark]}>
              {t.footer.madeWith} ❤️ {t.footer.inEthiopia}
            </Text>
          </View>
          <View style={styles.footerSocial}>
            <Text style={[styles.footerFollowUs, darkMode && styles.footerFollowUsDark]}>
              {t.footer.followUs}:
            </Text>
            <View style={styles.socialIcons}>
              <TouchableOpacity style={styles.socialIcon}>
                <Ionicons name="logo-facebook" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <Ionicons name="logo-twitter" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <Ionicons name="logo-linkedin" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <Ionicons name="logo-instagram" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <Ionicons name="logo-youtube" size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#111827',
    paddingVertical: 48,
    marginTop: 64,
  },
  footerDark: {
    backgroundColor: '#0f172a',
  },
  footerContent: {
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  footerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 24,
  },
  footerColumn: {
    flex: 1,
    minWidth: 250,
  },
  footerColumnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 16,
  },
  footerColumnTitleDark: {
    color: '#f3f4f6',
  },
  footerLink: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  footerLinkDark: {
    color: '#6b7280',
  },
  footerBottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  footerBottomLeft: {
    flex: 1,
    minWidth: 250,
  },
  footerCopyright: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  footerCopyrightDark: {
    color: '#6b7280',
  },
  footerMadeWith: {
    fontSize: 12,
    color: '#6b7280',
  },
  footerMadeWithDark: {
    color: '#4b5563',
  },
  footerSocial: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  footerFollowUs: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  footerFollowUsDark: {
    color: '#6b7280',
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialIcon: {
    padding: 4,
  },
});

export default Footer;

/**
 * React Native JobListings Screen
 * Browse jobs with search, filters, and pagination
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setTotalJobsCount } from '../store/jobsSlice';
import BottomNav from '../components/BottomNav.rn';
import apiService from '../services/api-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Job {
  _id: string;
  title: string;
  description: string;
  company?: string;
  budget: string;
  duration?: string;
  category: string;
  jobType?: string;
  workLocation?: string;
  experience?: string;
  skills?: string[];
  createdAt?: string;
  views?: number;
  applicants?: number;
  postedBy?: {
    _id: string;
    email: string;
    profile?: any;
  };
}

const JobListings: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const darkMode = useAppSelector((s) => s.theme.darkMode);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const scrollRef = useRef<ScrollView>(null);

  const categories = [
    'all',
    'Development',
    'Design',
    'Marketing',
    'Mobile',
    'Writing',
    'Translation',
    'Business',
    'Consulting',
  ];

  const jobTypes = ['all', 'Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote'];
  const locations = ['all', 'Remote', 'On-site', 'Hybrid', 'Addis Ababa', 'Other'];

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedJobType, selectedLocation]);

  useEffect(() => {
    fetchJobs();
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [selectedCategory, selectedJobType, selectedLocation, page]);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const response = await apiService.getJobs({
        page,
        limit: 5,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        jobType: selectedJobType !== 'all' ? selectedJobType : undefined,
        workLocation: selectedLocation !== 'all' ? selectedLocation : undefined,
        search: searchQuery || undefined,
      });

      setJobs(response.jobs || []);

      if (response.pagination) {
        dispatch(setTotalJobsCount(response.pagination.total));
        setTotalPages(response.pagination.pages);
      }

      setHasMore(response.pagination.current < response.pagination.pages);
    } catch (error: any) {
      // Don't log network errors if backend is offline - they're expected
      if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
        console.error('Error fetching jobs:', error);
      }
      // Set empty array on error so UI shows "no jobs" instead of loading forever
      if (page === 1) {
        setJobs([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchJobs();
  };

  const handleSearch = () => {
    setPage(1);
    setHasMore(true);
    fetchJobs();
  };

  const handleJobPress = (jobId: string) => {
    (navigation as any).navigate('JobDetails', { jobId });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      {/* HomeNavbar removed */}
      {/* Back Navigation Bar */}
      <View style={[styles.backNavContainer, darkMode && styles.backNavContainerDark, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: "MainSwipeableTabs" as never }],
          })}
        >
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#ffffff" : "#000000"} />
          <Text style={[styles.backText, darkMode && styles.backTextDark]}>Job Listings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={[styles.scrollView, darkMode && { backgroundColor: '#000' }]}
        contentContainerStyle={[styles.contentContainer, darkMode && { backgroundColor: '#000' }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search and Filter Section */}
        <View style={[styles.searchSection, darkMode && styles.searchSectionDark]}>
          <View style={[styles.searchContainer, darkMode && styles.searchContainerDark]}>
            <Ionicons name="search" size={20} color={darkMode ? '#999' : '#666'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, darkMode && styles.searchInputDark]}
              placeholder="Search jobs..."
              placeholderTextColor={darkMode ? '#999' : '#666'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  handleSearch();
                }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={darkMode ? '#999' : '#666'} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.filterButton, darkMode && styles.filterButtonDark]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter" size={20} color={darkMode ? '#fff' : '#000'} />
            <Text style={[styles.filterButtonText, darkMode && styles.filterButtonTextDark]}>
              Filters
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filters Panel */}
        {showFilters && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[styles.filtersPanel, darkMode && styles.filtersPanelDark]}
          >
            {/* Category Filter */}
            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, darkMode && styles.filterLabelDark]}>
                Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterChip,
                      selectedCategory === category && styles.filterChipActive,
                      darkMode && styles.filterChipDark,
                      selectedCategory === category && darkMode && styles.filterChipActiveDark,
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedCategory === category && styles.filterChipTextActive,
                        darkMode && styles.filterChipTextDark,
                        selectedCategory === category && darkMode && styles.filterChipTextActiveDark,
                      ]}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Job Type Filter */}
            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, darkMode && styles.filterLabelDark]}>
                Job Type
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                {jobTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterChip,
                      selectedJobType === type && styles.filterChipActive,
                      darkMode && styles.filterChipDark,
                      selectedJobType === type && darkMode && styles.filterChipActiveDark,
                    ]}
                    onPress={() => setSelectedJobType(type)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedJobType === type && styles.filterChipTextActive,
                        darkMode && styles.filterChipTextDark,
                        selectedJobType === type && darkMode && styles.filterChipTextActiveDark,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Location Filter */}
            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, darkMode && styles.filterLabelDark]}>
                Location
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                {locations.map((location) => (
                  <TouchableOpacity
                    key={location}
                    style={[
                      styles.filterChip,
                      selectedLocation === location && styles.filterChipActive,
                      darkMode && styles.filterChipDark,
                      selectedLocation === location && darkMode && styles.filterChipActiveDark,
                    ]}
                    onPress={() => setSelectedLocation(location)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedLocation === location && styles.filterChipTextActive,
                        darkMode && styles.filterChipTextDark,
                        selectedLocation === location && darkMode && styles.filterChipTextActiveDark,
                      ]}
                    >
                      {location.charAt(0).toUpperCase() + location.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSelectedCategory('all');
                setSelectedJobType('all');
                setSelectedLocation('all');
                setSearchQuery('');
                handleSearch();
              }}
            >
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsText, darkMode && styles.resultsTextDark]}>
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
          </Text>
        </View>

        {/* Jobs List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#06b6d4" />
            <Text style={[styles.loadingText, darkMode && styles.loadingTextDark]}>
              Loading jobs...
            </Text>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color={darkMode ? '#666' : '#999'} />
            <Text style={[styles.emptyText, darkMode && styles.emptyTextDark]}>
              No jobs found
            </Text>
            <Text style={[styles.emptySubtext, darkMode && styles.emptySubtextDark]}>
              Try adjusting your filters or search query
            </Text>
          </View>
        ) : (
          <View style={styles.jobsList}>
            {jobs.map((job, index) => (
              <Animated.View
                key={job._id}
                entering={FadeIn.duration(400).delay(index * 50)}
              >
                <TouchableOpacity
                  style={[styles.jobCard, darkMode && styles.jobCardDark]}
                  onPress={() => handleJobPress(job._id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.jobHeader}>
                    <View style={styles.jobTitleSection}>
                      <Text style={[styles.jobTitle, darkMode && styles.jobTitleDark]} numberOfLines={2}>
                        {job.title}
                      </Text>
                      {job.company && (
                        <Text style={[styles.jobCompany, darkMode && styles.jobCompanyDark]}>
                          {job.company}
                        </Text>
                      )}
                    </View>
                    <View style={styles.jobBudget}>
                      <Text style={styles.jobBudgetText}>{job.budget}</Text>
                    </View>
                  </View>

                  <Text
                    style={[styles.jobDescription, darkMode && styles.jobDescriptionDark]}
                    numberOfLines={3}
                  >
                    {job.description}
                  </Text>

                  <View style={styles.jobInfo}>
                    <View style={styles.jobInfoRow}>
                      <View style={styles.jobInfoItem}>
                        <Ionicons name="folder" size={16} color="#06b6d4" />
                        <Text style={[styles.jobInfoText, darkMode && styles.jobInfoTextDark]}>
                          {job.category}
                        </Text>
                      </View>
                      {job.jobType && (
                        <View style={styles.jobInfoItem}>
                          <Ionicons name="time" size={16} color="#06b6d4" />
                          <Text style={[styles.jobInfoText, darkMode && styles.jobInfoTextDark]}>
                            {job.jobType}
                          </Text>
                        </View>
                      )}
                      {job.workLocation && (
                        <View style={styles.jobInfoItem}>
                          <Ionicons name="location" size={16} color="#06b6d4" />
                          <Text style={[styles.jobInfoText, darkMode && styles.jobInfoTextDark]}>
                            {job.workLocation}
                          </Text>
                        </View>
                      )}
                    </View>

                    {job.skills && job.skills.length > 0 && (
                      <View style={styles.skillsContainer}>
                        {job.skills.slice(0, 3).map((skill, idx) => (
                          <View
                            key={idx}
                            style={[styles.skillTag, darkMode && styles.skillTagDark]}
                          >
                            <Text style={[styles.skillText, darkMode && styles.skillTextDark]}>
                              {skill}
                            </Text>
                          </View>
                        ))}
                        {job.skills.length > 3 && (
                          <Text style={[styles.moreSkillsText, darkMode && styles.moreSkillsTextDark]}>
                            +{job.skills.length - 3} more
                          </Text>
                        )}
                      </View>
                    )}
                  </View>

                  <View style={styles.jobFooter}>
                    <View style={styles.jobMeta}>
                      <View style={styles.jobMetaItem}>
                        <Ionicons name="eye" size={14} color={darkMode ? '#999' : '#666'} />
                        <Text style={[styles.jobMetaText, darkMode && styles.jobMetaTextDark]}>
                          {job.views || 0} views
                        </Text>
                      </View>
                      {job.applicants !== undefined && (
                        <View style={styles.jobMetaItem}>
                          <Ionicons name="people" size={14} color={darkMode ? '#999' : '#666'} />
                          <Text style={[styles.jobMetaText, darkMode && styles.jobMetaTextDark]}>
                            {job.applicants} applicants
                          </Text>
                        </View>
                      )}
                      <View style={styles.jobMetaItem}>
                        <Ionicons name="calendar-outline" size={14} color={darkMode ? '#999' : '#666'} />
                        <Text style={[styles.jobDate, darkMode && styles.jobDateDark]}>
                          {formatDate(job.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => handleJobPress(job._id)}
                    >
                      <Text style={styles.viewButtonText}>View Details</Text>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.paginationButton, page === 1 && styles.paginationButtonDisabled, darkMode && styles.paginationButtonDark]}
                  onPress={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <Ionicons name="chevron-back" size={20} color={page === 1 ? (darkMode ? '#444' : '#ccc') : (darkMode ? '#fff' : '#000')} />
                </TouchableOpacity>

                <View style={styles.pageNumbers}>
                  {(() => {
                    const pages = [];
                    // Simple page numbering logic: show 5 pages around current
                    let start = Math.max(1, page - 2);
                    let end = Math.min(totalPages, start + 4);
                    if (end === totalPages) start = Math.max(1, end - 4);

                    for (let i = start; i <= end; i++) {
                      pages.push(
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.pageNumber,
                            page === i && styles.pageNumberActive,
                            darkMode && styles.pageNumberDark,
                            page === i && darkMode && styles.pageNumberActiveDark,
                          ]}
                          onPress={() => setPage(i)}
                        >
                          <Text style={[
                            styles.pageNumberText,
                            page === i && styles.pageNumberTextActive,
                            darkMode && styles.pageNumberTextDark,
                            page === i && darkMode && styles.pageNumberTextActiveDark
                          ]}>
                            {i}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                    return pages;
                  })()}
                </View>

                <TouchableOpacity
                  style={[styles.paginationButton, page === totalPages && styles.paginationButtonDisabled, darkMode && styles.paginationButtonDark]}
                  onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <Ionicons name="chevron-forward" size={20} color={page === totalPages ? (darkMode ? '#444' : '#ccc') : (darkMode ? '#fff' : '#000')} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchSectionDark: {
    backgroundColor: '#111',
    borderBottomColor: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchContainerDark: {
    backgroundColor: '#111',
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  searchInputDark: {
    color: '#fff',
    backgroundColor: '#1a1a1a',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06b6d4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  filterButtonDark: {
    backgroundColor: '#06b6d4',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextDark: {
    color: '#fff',
  },
  filtersPanel: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersPanelDark: {
    backgroundColor: '#111',
    borderBottomColor: '#333',
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  filterLabelDark: {
    color: '#fff',
  },
  filterChips: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipDark: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
  },
  filterChipActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  filterChipActiveDark: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextDark: {
    color: '#999',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  filterChipTextActiveDark: {
    color: '#fff',
  },
  clearFiltersButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearFiltersText: {
    color: '#06b6d4',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  resultsTextDark: {
    color: '#fff',
  },
  jobsList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  jobCardDark: {
    backgroundColor: '#111',
    borderColor: '#333',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  jobTitleDark: {
    color: '#fff',
  },
  jobCompany: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  jobCompanyDark: {
    color: '#999',
  },
  jobBudget: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  jobBudgetText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  jobDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  jobDescriptionDark: {
    color: '#999',
  },
  jobInfo: {
    marginBottom: 12,
  },
  jobInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  jobInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jobInfoText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  jobInfoTextDark: {
    color: '#999',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  skillTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skillTagDark: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
  },
  skillText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  skillTextDark: {
    color: '#999',
  },
  moreSkillsText: {
    fontSize: 11,
    color: '#06b6d4',
    fontWeight: '600',
    alignSelf: 'center',
  },
  moreSkillsTextDark: {
    color: '#06b6d4',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    flexWrap: 'wrap',
  },
  jobMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  jobMetaText: {
    fontSize: 12,
    color: '#666',
  },
  jobMetaTextDark: {
    color: '#999',
  },
  jobDate: {
    fontSize: 12,
    color: '#666',
  },
  jobDateDark: {
    color: '#999',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06b6d4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    flexShrink: 0,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  loadingTextDark: {
    color: '#999',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    color: '#000',
  },
  emptyTextDark: {
    color: '#fff',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtextDark: {
    color: '#999',
  },
  backNavContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backNavContainerDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  backTextDark: {
    color: '#ffffff',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    gap: 8,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paginationButtonDark: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 8,
  },
  pageNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pageNumberDark: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
  },
  pageNumberActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  pageNumberActiveDark: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  pageNumberTextDark: {
    color: '#999',
  },
  pageNumberTextActive: {
    color: '#fff',
  },
  pageNumberTextActiveDark: {
    color: '#fff',
  },
});

export default JobListings;

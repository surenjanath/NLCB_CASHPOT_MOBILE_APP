import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Search, X, Filter } from 'lucide-react-native';
import { SearchFilters } from '@/types/lotto';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
}

export function SearchBar({ 
  onSearch, 
  onFiltersChange, 
  placeholder = "Search draws...",
  showFilters = true 
}: SearchBarProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleFiltersPress = () => {
    // This could open a filters modal
    // TODO: Implement filters modal
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.colors.surface,
        borderColor: isFocused ? theme.colors.primary : theme.colors.border,
      }
    ]}>
      <View style={styles.searchIconContainer}>
        <Search 
          size={20} 
          color={isFocused ? theme.colors.primary : theme.colors.textSecondary} 
        />
      </View>
      
      <TextInput
        style={[
          styles.input, 
          { 
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        value={query}
        onChangeText={handleSearch}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
      />
      
      {query.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
      
      {showFilters && (
        <TouchableOpacity
          style={[
            styles.filtersButton,
            { borderColor: theme.colors.border }
          ]}
          onPress={handleFiltersPress}
        >
          <Filter size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  filtersButton: {
    borderLeftWidth: 1,
    paddingLeft: 12,
    marginLeft: 8,
    paddingVertical: 4,
  },
});

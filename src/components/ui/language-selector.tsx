'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { LANGUAGES, Language } from '@/lib/constants/languages';

interface LanguageSelection {
  name: string;
  interface: boolean;
  audio: boolean;
  subtitles: boolean;
}

interface LanguageSelectorProps {
  selectedLanguages: LanguageSelection[];
  onSelectionChange: (languages: LanguageSelection[]) => void;
  maxSelections?: number;
  placeholder?: string;
}

export function LanguageSelector({
  selectedLanguages,
  onSelectionChange,
  maxSelections = 10,
  placeholder = "Select languages..."
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedLanguages.find(selected => selected.name === lang.name)
  );

  const addLanguage = (language: Language) => {
    if (selectedLanguages.length >= maxSelections) return;
    
    const newLanguage: LanguageSelection = {
      name: language.name,
      interface: false,
      audio: false,
      subtitles: false
    };
    
    onSelectionChange([...selectedLanguages, newLanguage]);
    setIsOpen(false);
    setSearchTerm('');
  };

  const removeLanguage = (languageName: string) => {
    onSelectionChange(selectedLanguages.filter(lang => lang.name !== languageName));
  };

  const updateLanguageSupport = (languageName: string, supportType: 'interface' | 'audio' | 'subtitles', value: boolean) => {
    onSelectionChange(selectedLanguages.map(lang => 
      lang.name === languageName 
        ? { ...lang, [supportType]: value }
        : lang
    ));
  };

  return (
    <div className="space-y-3">
      {/* Selected Languages */}
      {selectedLanguages.length > 0 && (
        <div className="space-y-2">
          {selectedLanguages.map((lang) => (
            <Card key={lang.name} className="rounded-xl border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {LANGUAGES.find(l => l.name === lang.name)?.flag || '🌐'}
                    </span>
                    <span className="font-medium">{lang.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(lang.name)}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${lang.name}-interface`}
                      checked={lang.interface}
                      onCheckedChange={(checked) => 
                        updateLanguageSupport(lang.name, 'interface', checked as boolean)
                      }
                    />
                    <Label htmlFor={`${lang.name}-interface`} className="text-sm">Interface</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${lang.name}-audio`}
                      checked={lang.audio}
                      onCheckedChange={(checked) => 
                        updateLanguageSupport(lang.name, 'audio', checked as boolean)
                      }
                    />
                    <Label htmlFor={`${lang.name}-audio`} className="text-sm">Full Audio</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${lang.name}-subtitles`}
                      checked={lang.subtitles}
                      onCheckedChange={(checked) => 
                        updateLanguageSupport(lang.name, 'subtitles', checked as boolean)
                      }
                    />
                    <Label htmlFor={`${lang.name}-subtitles`} className="text-sm">Subtitles</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Language Button */}
      {selectedLanguages.length < maxSelections && (
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full justify-start text-left font-normal rounded-xl border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            {placeholder}
          </Button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                {filteredLanguages.map((language) => (
                  <button
                    key={language.id}
                    onClick={() => addLanguage(language)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span className="text-sm">{language.name}</span>
                  </button>
                ))}
                
                {filteredLanguages.length === 0 && (
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No languages found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selection Count */}
      <div className="text-xs text-muted-foreground">
        {selectedLanguages.length}/{maxSelections} languages selected
      </div>
    </div>
  );
}

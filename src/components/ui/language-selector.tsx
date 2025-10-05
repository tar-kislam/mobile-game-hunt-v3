'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Plus, Search, Globe } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Selected Languages */}
      <AnimatePresence>
        {selectedLanguages.length > 0 && (
          <div className="space-y-3">
            {selectedLanguages.map((lang, index) => (
              <motion.div
                key={lang.name}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="group"
              >
                {/* Landing Page Style Card */}
                <div className="border border-transparent bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-violet-600/20 p-[1px] rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  <Card className="relative bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-900/80 backdrop-blur-xl rounded-2xl border-gray-800/50 shadow-lg transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-[1.02]">
                    <CardContent className="p-5">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center text-lg">
                              {LANGUAGES.find(l => l.name === lang.name)?.flag || '🌐'}
                            </div>
                          </div>
                          <div>
                            <h3 className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent font-bold text-lg leading-tight">
                              {lang.name}
                            </h3>
                            <p className="text-sm text-gray-400">Language Configuration</p>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLanguage(lang.name)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 rounded-xl"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Support Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <motion.div 
                          className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:border-purple-500/50 transition-all duration-300 group"
                          whileHover={{ scale: 1.02 }}
                        >
                          <Checkbox
                            id={`${lang.name}-interface`}
                            checked={lang.interface}
                            onCheckedChange={(checked) => 
                              updateLanguageSupport(lang.name, 'interface', checked as boolean)
                            }
                            className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                          />
                          <Label htmlFor={`${lang.name}-interface`} className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors cursor-pointer">
                            Interface
                          </Label>
                        </motion.div>
                        
                        <motion.div 
                          className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:border-purple-500/50 transition-all duration-300 group"
                          whileHover={{ scale: 1.02 }}
                        >
                          <Checkbox
                            id={`${lang.name}-audio`}
                            checked={lang.audio}
                            onCheckedChange={(checked) => 
                              updateLanguageSupport(lang.name, 'audio', checked as boolean)
                            }
                            className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                          />
                          <Label htmlFor={`${lang.name}-audio`} className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors cursor-pointer">
                            Full Audio
                          </Label>
                        </motion.div>
                        
                        <motion.div 
                          className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:border-purple-500/50 transition-all duration-300 group"
                          whileHover={{ scale: 1.02 }}
                        >
                          <Checkbox
                            id={`${lang.name}-subtitles`}
                            checked={lang.subtitles}
                            onCheckedChange={(checked) => 
                              updateLanguageSupport(lang.name, 'subtitles', checked as boolean)
                            }
                            className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                          />
                          <Label htmlFor={`${lang.name}-subtitles`} className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors cursor-pointer">
                            Subtitles
                          </Label>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Add Language Button */}
      {selectedLanguages.length < maxSelections && (
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: selectedLanguages.length * 0.1 + 0.2 }}
        >
          {/* Landing Page Style Add Button */}
          <div className="border border-transparent bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-violet-600/20 p-[1px] rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <Button
              variant="outline"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full justify-start text-left font-normal rounded-2xl border-dashed border-2 border-purple-500/30 hover:border-purple-400/50 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-900/80 backdrop-blur-xl hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300 hover:scale-[1.02] h-12"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-300">{placeholder}</span>
              </div>
            </Button>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 z-50 mt-2"
              >
                {/* Landing Page Style Dropdown */}
                <div className="border border-transparent bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-violet-600/20 p-[1px] rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                  <div className="bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-900/95 backdrop-blur-xl rounded-2xl border-gray-800/50 shadow-lg max-h-60 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-4 border-b border-gray-700/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search languages..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-sm bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    {/* Language List */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredLanguages.map((language, index) => (
                        <motion.button
                          key={language.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => addLanguage(language)}
                          className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-violet-600/20 flex items-center gap-3 transition-all duration-300 group"
                        >
                          <span className="text-lg group-hover:scale-110 transition-transform duration-300">{language.flag}</span>
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300">{language.name}</span>
                        </motion.button>
                      ))}
                      
                      {filteredLanguages.length === 0 && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="px-4 py-6 text-center"
                        >
                          <Globe className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                          <div className="text-sm text-gray-400">No languages found</div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Selection Count */}
      <motion.div 
        className="flex items-center justify-center gap-2 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30">
          <span className="text-purple-300 font-semibold">
            {selectedLanguages.length}/{maxSelections} languages selected
          </span>
        </div>
      </motion.div>
    </div>
  );
}

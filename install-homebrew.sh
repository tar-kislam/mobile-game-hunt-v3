#!/bin/bash

# Homebrew Kurulum Scripti
# Bu script Homebrew'u kurar ve PATH'e ekler

set -e

echo "🍺 Homebrew kurulumu başlatılıyor..."
echo ""

# Homebrew zaten kurulu mu kontrol et
if [ -f /opt/homebrew/bin/brew ] || [ -f /usr/local/bin/brew ]; then
    echo "✅ Homebrew zaten kurulu!"
    if [ -f /opt/homebrew/bin/brew ]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
        echo "📍 Konum: /opt/homebrew/bin/brew (Apple Silicon)"
    else
        eval "$(/usr/local/bin/brew shellenv)"
        echo "📍 Konum: /usr/local/bin/brew (Intel)"
    fi
    brew --version
    exit 0
fi

echo "📦 Homebrew kuruluyor..."
echo "⚠️  Bu işlem sudo gerektirir ve şifre isteyebilir"
echo ""

# Homebrew kurulumu
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# PATH'e ekle
if [ -f /opt/homebrew/bin/brew ]; then
    echo ""
    echo "✅ Homebrew kuruldu (Apple Silicon)"
    echo "📍 PATH'e ekleniyor..."
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
    eval "$(/opt/homebrew/bin/brew shellenv)"
    export PATH="/opt/homebrew/bin:$PATH"
elif [ -f /usr/local/bin/brew ]; then
    echo ""
    echo "✅ Homebrew kuruldu (Intel)"
    echo "📍 PATH'e ekleniyor..."
    echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
    eval "$(/usr/local/bin/brew shellenv)"
    export PATH="/usr/local/bin:$PATH"
fi

echo ""
echo "🎉 Homebrew kurulumu tamamlandı!"
echo ""
brew --version
echo ""
echo "Sonraki adım: Colima kurulumu için './setup-docker.sh' çalıştırın"










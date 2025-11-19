#!/bin/bash

# Mobile Game Hunt - Docker Setup Script (Colima - Lightweight)
# Bu script Colima ve Docker'ı kurar

set -e

echo "🚀 Docker kurulumu başlatılıyor (Colima - Lightweight)..."
echo ""

# Homebrew kontrolü
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew bulunamadı!"
    echo ""
    echo "Lütfen önce Homebrew'u kurun:"
    echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo ""
    echo "Kurulumdan sonra bu scripti tekrar çalıştırın."
    exit 1
fi

echo "✅ Homebrew bulundu"
echo ""

# Colima kurulumu
if ! command -v colima &> /dev/null; then
    echo "📦 Colima kuruluyor..."
    brew install colima docker docker-compose
    echo "✅ Colima kuruldu"
else
    echo "✅ Colima zaten kurulu"
fi

echo ""

# Colima başlatma
if ! colima status &> /dev/null; then
    echo "🚀 Colima başlatılıyor..."
    colima start
    echo "✅ Colima başlatıldı"
else
    echo "✅ Colima zaten çalışıyor"
fi

echo ""
echo "🎉 Docker kurulumu tamamlandı!"
echo ""
echo "Docker durumunu kontrol etmek için:"
echo "  docker ps"
echo ""
echo "Colima durumunu kontrol etmek için:"
echo "  colima status"
echo ""










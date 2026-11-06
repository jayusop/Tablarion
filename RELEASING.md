# 배포 가이드 (관리자용)

Tablarion은 저장소 두 개로 공개합니다. 구조는 Audio Mixer(`jayusop/Audio-Mixer`)와 같고, AGPL 때문에 소스 저장소가 하나 더 있습니다.

| GitHub 저장소 | 로컬 폴더 | 내용 | 공개 위치 |
|---|---|---|---|
| `jayusop/Tablarion` | `~/Develop/RSE-VST-doc` (이 폴더) | README(6개 언어), LICENSE, `docs/` 소개 페이지, **Releases**, Issues | `https://jayusop.github.io/Tablarion/` |
| `jayusop/Tablarion-source` | `~/Develop/RSE-VST` | 플러그인 전체 소스 (AGPL 소스 공개) | `https://github.com/jayusop/Tablarion-source` |

```
RSE-VST-doc/                     → jayusop/Tablarion
├── README.md                    한국어 (기본)
├── README.en.md · README.en-GB.md · README.zh-CN.md · README.ja.md · README.fr.md
├── LICENSE                      AGPL-3.0 원문
├── LICENSE.ko.md                한국어 안내 (비공식)
├── THIRD_PARTY_LICENSES.txt     제3자 라이선스 전문 — 배포 zip에도 넣음
├── RELEASING.md                 이 문서
└── docs/                        GitHub Pages (main / docs)
    ├── index.html               소개 페이지 (KO/EN, ?lang=ko|en)
    ├── licenses.html            라이선스·제3자 고지 상세
    ├── config.js                ← 저장소 이름은 여기 한 곳에서만 바꿈
    ├── script.js · style.css
    ├── icon.png · screenshot.png
    └── .nojekyll
```

## 1. 소스 저장소 올리기 (`Tablarion-source`)

GitHub에서 빈 저장소 `Tablarion-source`를 **Public**으로 만든 뒤:

```sh
cd ~/Develop/RSE-VST
echo "ui-preview.png" >> .gitignore    # .claude/, sf2/, *.sf2 는 이미 제외되어 있음
git add .
git commit -m "Tablarion 1.0.0"
git branch -M main
git remote add origin https://github.com/jayusop/Tablarion-source.git
git push -u origin main
git tag v1.0.0 && git push origin v1.0.0   # 릴리스와 같은 태그로 "대응하는 소스"를 고정
```

> `sf2/Tablarion-GM.sf2`(약 640 MB)는 git에 넣지 않습니다(GitHub 파일당 100 MB 제한). 뱅크를 만드는 코드 `Tools/SF2Builder.cpp`가 저장소에 있으므로 AGPL 소스 공개 조건은 충족됩니다.
>
> 소스의 `CMakeLists.txt` 기본값(`TABLARION_SOURCE_URL`)과 README 예시는 아직 `YOUR-ACCOUNT/Tablarion`입니다. 빌드할 때 아래처럼 실제 주소를 넘기면 About 창에는 올바른 주소가 들어갑니다.

## 2. 릴리스 빌드와 zip 만들기

```sh
cd ~/Develop/RSE-VST
rm -rf build                          # build/ 가 남아 있으면 옵션이 무시됨
./build_universal.sh -DTABLARION_SOURCE_URL=https://github.com/jayusop/Tablarion-source

ART=build/Tablarion_artefacts/Release
rm -rf dist && mkdir -p dist/Tablarion
cp -R "$ART/VST3/Tablarion.vst3" "$ART/AU/Tablarion.component" "$ART/Standalone/Tablarion.app" \
      LICENSE THIRD_PARTY_NOTICES.md ../RSE-VST-doc/THIRD_PARTY_LICENSES.txt dist/Tablarion/
(cd dist && ditto -c -k --keepParent Tablarion Tablarion-macOS.zip)
```

## 3. GitHub Release (`jayusop/Tablarion`)

**Releases → Draft a new release** → 태그 `v1.0.0` → 아래 파일 첨부 → Publish.

| 첨부 파일 (이름 고정) | 내용 |
|---|---|
| `Tablarion-macOS.zip` | 플러그인 (VST3 / AU / Standalone, 유니버설, macOS 12+) + 라이선스 파일 |
| `Tablarion-GM.sf2` | 선택 사항인 GM SoundFont (`~/Develop/RSE-VST/sf2/` 의 파일 그대로) |

README와 소개 페이지의 다운로드 링크는 `releases/latest/download/<파일 이름>` 형식이라, **파일 이름을 바꾸지 않으면** 새 버전을 올릴 때 링크를 고칠 필요가 없습니다. 릴리스 설명에 소스 링크(`https://github.com/jayusop/Tablarion-source/tree/v1.0.0`)를 넣어 두면 AGPL의 "대응하는 소스" 안내가 명확해집니다.

## 4. 소개 페이지 공개 (GitHub Pages)

```sh
cd ~/Develop/RSE-VST-doc
git init -b main && git add . && git commit -m "Tablarion website and release notes"
git remote add origin https://github.com/jayusop/Tablarion.git
git push -u origin main
```

GitHub 저장소 → **Settings → Pages** → Source: *Deploy from a branch*, Branch: `main` / **`/docs`** → Save.
1~2분 뒤 `https://jayusop.github.io/Tablarion/` 에서 확인합니다. 두 저장소의 About → Website에 이 주소를 넣어 두세요.

로컬 미리보기: `cd ~/Develop/RSE-VST-doc/docs && python3 -m http.server 8000` → <http://localhost:8000>

## 5. 화면 이미지·SoundFont 다시 만들기

```sh
cd ~/Develop/RSE-VST
cmake -B build-cli -DTABLARION_BUILD_TOOLS=ON
cmake --build build-cli --config Release --target UISnapshot SF2Builder
./build-cli/UISnapshot_artefacts/Release/UISnapshot <직접 만든 곡>.gp ../RSE-VST-doc/docs/screenshot.png
./build-cli/SF2Builder_artefacts/Release/SF2Builder sf2/Tablarion-GM.sf2
```

> 화면 이미지에는 실제 곡 제목이 보이지 않도록 직접 만든 악보를 쓰세요.

<div align="center" >

# Mind Sync (Mind Synchronize)

마인드맵 실시간 공동 편집 어플리케이션

<img src="https://github.com/boostcampwm2023/and07-MindSync/assets/39490416/d2631e86-630d-4489-94ed-f0abd44547de" height="400">

</br>

[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fboostcampwm2023%2Fand07-MindSync%2Fhit-counter&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)

</div>

## ✨ 프로젝트 소개

- 마인드맵을 사용하여 아이디어를 시각적으로 표현해보세요
- 협업을 원하는 친구나 동료를 초대하는 것도 가능합니다
- 간편하게 마인드맵을 생성하고, 다른 사용자들과 실시간으로 공동 편집을 진행할 수 있어요


## 👨‍👩‍👧‍👦 팀원 소개

|[김찬희(J035)](https://github.com/Conut-1) | [양선아(K023)](https://github.com/yang1318) | [이상준(K027)](https://github.com/hegleB) | [이용환(J110)](https://github.com/tnpfldyd) | [이재한(K029)](https://github.com/jaehan4707) |
|:--------:|:---------:|:---------:|:---------:|:---------:|
| ![](https://github.com/Conut-1.png) | ![](https://github.com/yang1318.png) | ![](https://github.com/hegleB.png) | ![](https://github.com/tnpfldyd.png) | ![](https://github.com/jaehan4707.png) |

## ⚒️ 기능 소개

### 🚀 스페이스
|스페이스 추가|초대 코드 발급|스페이스 참가|스페이스 나가기|
|:---:|:---:|:---:|:---:|
| ![스페이스추가](https://github.com/boostcampwm2023/and07-MindSync/assets/39490416/5c0767b5-0367-42bc-96a3-bf09258b8b12) | ![초대코드발급](https://github.com/boostcampwm2023/and07-MindSync/assets/39490416/25f3a8e9-ba33-4475-b9f1-1d6719f89619) | ![스페이스참가](https://github.com/boostcampwm2023/and07-MindSync/assets/39490416/ef76a871-f7f9-481b-913b-ed87f7775465) | ![스페이스나가기](https://github.com/boostcampwm2023/and07-MindSync/assets/39490416/73ba5493-b7c9-447a-b035-a4e5037c81fd) |

### 📃 보드


|보드 생성|보드 삭제|휴지통|
|:---:|:---:|:---:|
|<img src="https://github.com/boostcampwm2023/and07-MindSync/assets/39490416/b6237b45-4fbf-4b26-81ad-ef051926ff34" width=200 height=400/>|<img src="https://github.com/boostcampwm2023/and07-MindSync/assets/39490416/b26fe997-b374-4db4-a0c3-c67682ca5fe7" width=200 height=400/>|<img src="https://github.com/boostcampwm2023/and07-MindSync/assets/39490416/bd80ce6a-faf9-4d81-b6dd-aff8b65a6589" width=200 height=400/>|

### 🧠 마인드맵
|노드 추가|노드 삭제|노드 편집|
|:---:|:---:|:---:|
|<img src="https://github.com/boostcampwm2023/and07-MindSync/assets/39490416/b6310037-551c-4c6e-9d78-6add7d7d70b5" width=200 height=400/>|<img src="https://github.com/boostcampwm2023/and07-MindSync/assets/39490416/d149109f-3c52-4e87-93cb-c3c7113fcfee" width=200 height=400/>|<img src="https://github.com/boostcampwm2023/and07-MindSync/assets/39490416/f969ef4d-3743-4e6c-a334-6bdf6ccd8f4d" width=200 height=400/>|

|노드 이동|확대/축소/드래그|실시간동시편집|
|:---:|:---:|:---:|
|<img src="https://github.com/boostcampwm2023/and07-MindSync/assets/39490416/4a458d20-680b-479c-8bbb-17757f5b83ae" width=200 height=400/>|<img src="https://github.com/boostcampwm2023/and07-MindSync/assets/39490416/3150048e-9eb3-4a08-97a8-3afa707cf03f" width=200 height=400/>|<img src="https://github.com/boostcampwm2023/and07-MindSync/assets/39490416/db89c76e-4e3b-4ddb-ba76-0e9387f9ebef" width=200 height=400/>|


## 🎯 기술적 도전
저희는 다음과 같은 과제에 도전했습니다.
1. **마인드맵을 그릴 수 있다.**
2. **마인드맵을 동시에 실시간 편집 할 수 있다.**

그래서 해당 과제를 수행하기 위해 다음과 같은 과정을 거쳤습니다.
1. <span style="background-color: #E6E6FA">**마인드맵을 그리기 위해** </span>
       
    - **노드를 그려주는 커스텀 뷰와 라인을 그려주는 커스텀 뷰를 구현했습니다.**
      - [커스텀뷰 학습하기](https://yangyang-workspace.notion.site/CustomView-9d4a86f6cd2046f4806d42655d220340?pvs=4)
      - [마인드맵을 저장하는 자료구조 설계하기](https://yangyang-workspace.notion.site/d89604f305e7406fa8243ddb0926706a?pvs=4)
      - [라인을 곡선으로 그리기](https://yangyang-workspace.notion.site/5adf5fa59e464e7ba316ad5dc4b0db51?pvs=4)
      - [텍스트 크기에 따른 노드 크기 자동화](https://yangyang-workspace.notion.site/CustomView-DrawText-0c7165d51af84f50b82673fde84766a5?pvs=4)
    - **줌 기능을 추가하고, 늘어나는 마인드맵의 크기에 따라 줌을 조절했습니다.**
      - [마인드맵이 커졌을 때 잘리는 현상 해결 과정](https://yangyang-workspace.notion.site/947792eae0014041aa1d7d92869a1d71?pvs=4)
      - [줌 기능이 추가됨에 따라, 노드 이동기능과 겹치는 터치 이벤트 관리하기](https://yangyang-workspace.notion.site/56448f36097049e4acef2897fecac41a?pvs=4)
    - **노드가 추가/편집 될 때마다 크기를 재고, 정렬하도록 했습니다.**
      - [정렬 알고리즘](https://yangyang-workspace.notion.site/067de1120ec841808d46279d752b9352?pvs=4)
3. <span style="background-color: #E6E6FA">**마인드맵을 동시에 실시간 편집 할 수 있도록 하기 위해**</span>
    
    - [Tree 구조에 적용가능한 작업기반 CRDT를 구현했습니다.](https://yangyang-workspace.notion.site/CRDT-093a7ce7785543cc8c69ac84c138a955?pvs=4)
    - [socket.io 학습하기](https://yangyang-workspace.notion.site/Socket-IO-bd7ceaba859a4449bfe73bbeaa2f6798?pvs=4)
4. <span style="background-color: #E6E6FA">**빠른 응답을 위한 캐싱을 적용했습니다.**</span>
    
   - [캐시 적용기](https://yangyang-workspace.notion.site/Cache-c3a6b494d39c45ce93c2ee9dd95cf6e6?pvs=4)
5. <span style="background-color: #E6E6FA">**동시에 마인드맵을 편집할 수 있는 공간인 스페이스와 마인드맵을 서버에 저장하는 보드를 설계했습니다.**</span>
    
6. <span style="background-color: #E6E6FA">**자주 소통하도록 노력하며 협업했습니다.**</span>
    - 페어프로그래밍을 자주 했습니다.
    - 안드로이드&백엔드 분야간의 소통도 매일 활발하게 이루어졌습니다.
      - 초반에는 매일 1시간의 티타임을 가지면서 매일 1시간씩 꼭 대화하는 시간을 가졌습니다.
      - api 적용, 소켓 통신을 개발하기 시작하고 나서부터는 더 많은 소통이 필요했고, 그래서 같은 회의실을 사용해서 서로의 이슈를 바로바로 공유할 수 있도록 했습니다.

## 🚀 문제 해결 과정
- [안드로이드에 Access Token과 Refresh Token 적용하기](https://yangyang-workspace.notion.site/Access-Token-Refresh-Token-DataStore-Preference-Interceptor-Authenticator-9934da08678f4b13a5396f47038e1f7f?pvs=4)
- [서버에 Bulk Insert 및 Update 적용하기](https://yangyang-workspace.notion.site/Bulk-Insert-Update-ec109de908e54b4f833ffaf24e206d8c?pvs=4)
- [서버에 카카오 OAuth 적용하기](https://yangyang-workspace.notion.site/OAuth-ceee7681f4124d34aafd714728b8aaeb?pvs=4)
- [서버에 Refresh Toekn 적용하기](https://yangyang-workspace.notion.site/Refresh-Token-66f30a6645cb472582817f695d759e28?pvs=4)
- [안드로이드 CI 적용기](https://yangyang-workspace.notion.site/Android-CI-7eb07b0b0c5346959a1271c526993604?pvs=4)
- [안드로이드 CD 적용기](https://yangyang-workspace.notion.site/Android-CD-7bf21956eafc47b8bd5a06990f3852da?pvs=4)
- [서버 중복 코드를 추상 클래스로 분리하기](https://yangyang-workspace.notion.site/228c00d520ed42e7a2706297fc7c1c09?pvs=4)

## 📚 기술스택

### AOS

- `Kotlin` `Canvas` `Socket.IO` `Coil` `MVVM` `Retrofit` `Datastore` `Hilt` `Flow` `Jetpack Navigation` `DataBinding`
### BE

- `Typescript` `NestJS` `Naver Cloud Platform` `MySQL` `MongoDB`


## 📑 문서
|설계서|기획서&디자인|백로그|그라운드 룰|컨벤션|
|:---:|:---:|:---:|:---:|:---:|
|[📒설계서](https://yangyang-workspace.notion.site/7efada904a3d44328474a6fb30689db7?pvs=4)|[📕기획서&디자인](https://www.figma.com/file/Wb1U49Xd2W9xKHaPEltIRB/MindSync?type=design&node-id=2%3A218&mode=design&t=3MJMbYI1z4k217UB-1)|[🧾백로그](https://github.com/orgs/boostcampwm2023/projects/41)|[⛳그라운드 룰](https://github.com/boostcampwm2023/and07-MindSync/wiki/%ED%8C%80-%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C-%EB%A3%B0)|[🤝컨벤션](https://github.com/boostcampwm2023/and07-MindSync/wiki/Git-%EC%BB%A8%EB%B2%A4%EC%85%98#%EF%B8%8Fconventions)|

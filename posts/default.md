---
title: default post test
author: brillbe
date: 2025-12-22
createdAt: 2025-1
---

# [이직용]미니프로젝트 - 권한관리보드

기술스택: React, Typescript
규모: MINI

- 초안
  ### 권한 모델
  - 권한 종류 : Root, Group Manager, Product Manager, Operator
  - 조직 구조
    - Group
      - Group Manager(1명)
      - Product Manager(N명)
      - Operator(M명)
  ```mermaid
  graph TD

      Root["조직 Root"]

      Root --> Group1["그룹 1"]

      %% 그룹 1 전체
      subgraph Group1["그룹 1"]
          GroupManager["그룹 매니저"]

          %% Product Manager A
          subgraph PMA["Product Manager A"]
              PMA_P1["Product 1"]
              PMA_P2["Product 2"]

              PMA_P1 --> OpP1_1["Operator P1-1"]
              PMA_P1 --> OpP1_2["Operator P1-2"]

              PMA_P2 --> OpP2_1["Operator P2-1"]
          end

          %% Product Manager B
          subgraph PMB["Product Manager B"]
              PMB_P3["Product 3"]
              PMB_P4["Product 4"]

              PMB_P3 --> OpP3_1["Operator P3-1"]
              PMB_P4 --> OpP4_1["Operator P4-1"]
          end
      end


  ```
  | 역할            | Product 접근 범위         | 이미지 생성 | 이미지 삭제            | 이미지 수정            | Product 수정 | 비고           |
  | --------------- | ------------------------- | ----------- | ---------------------- | ---------------------- | ------------ | -------------- |
  | Group Manager   | 모든 Product              | 가능        | 모든 이미지            | 모든 이미지            | 모든 Product | 최상위         |
  | Product Manager | 본인 Product              | 가능        | 본인 Product 내 이미지 | 본인 Product 내 이미지 | 본인 Product | PM끼리 공유 X  |
  | Operator        | 할당된 Product에 대해서만 | 가능        | 자기 이미지만          | 자기 이미지만          | 불가         | 생성 기능 중심 |
  - 권한 매트릭스
  **1-1. 그룹 단위(Group Level)**
  | 기능                       | Group Manager | Product Manager          | Operator | 비고                     |
  | -------------------------- | ------------- | ------------------------ | -------- | ------------------------ |
  | 그룹 전체 Product 조회     | 가능          | 불가                     | 불가     | PM/OP는 자신의 Product만 |
  | 그룹 구성원 조회           | 가능          | 불가                     | 불가     |                          |
  | Product Manager 생성/할당  | 가능          | 불가                     | 불가     |                          |
  | Operator 생성/할당         | 가능          | 자신의 Product 내만 가능 | 불가     |                          |
  | 그룹 전체 이미지/피드 검수 | 가능          | 불가                     | 불가     |                          |
  ***
  **1-2. Product 단위(Product Level)**
  | 기능                    | Group Manager | Product Manager     | Operator         | 비고            |
  | ----------------------- | ------------- | ------------------- | ---------------- | --------------- |
  | Product 생성            | 가능          | 가능                | 불가             |                 |
  | Product 수정            | 가능          | 자신의 Product만    | 불가             |                 |
  | Product 삭제            | 가능          | 자신의 Product만    | 불가             |                 |
  | Product 상세 조회       | 가능          | 자신의 Product만    | 할당된 Product만 | PM 간 접근 불가 |
  | Product별 Operator 관리 | 가능          | 자신의 Product 내만 | 불가             |                 |
  ***
  ### **1-3. 이미지(Image) 권한**
  | 기능             | Group Manager | Product Manager          | Operator       | 비고           |
  | ---------------- | ------------- | ------------------------ | -------------- | -------------- |
  | 이미지 업로드    | 가능          | 가능                     | 가능           | Product 내에서 |
  | 이미지 조회      | 가능          | 자신의 Product만         | 할당 Product만 | Scope 기반     |
  | 이미지 수정      | 가능          | 자신의 Product 내 이미지 | 본인 업로드만  | Ownership      |
  | 이미지 삭제      | 가능          | 자신의 Product 내 이미지 | 본인 업로드만  | Ownership      |
  | 이미지 승인/검수 | 가능          | 가능                     | 불가           |                |
  ***
  ### **1-4. 피드/콘텐츠(Feed) 권한**
  | 기능           | Group Manager | Product Manager   | Operator    | 비고 |
  | -------------- | ------------- | ----------------- | ----------- | ---- |
  | 피드 생성      | 가능          | 가능              | 가능        |      |
  | 피드 수정      | 가능          | 자신의 Product 내 | 본인 작성만 |      |
  | 피드 삭제      | 가능          | 자신의 Product 내 | 본인 작성만 |      |
  | 피드 검수/승인 | 가능          | 가능              | 불가        |      |
  ***
  - 접근 스코프
    ### **1-5. 역할/계정(Account Role)**
    | 기능              | Group Manager | Product Manager   | Operator | 비고              |
    | ----------------- | ------------- | ----------------- | -------- | ----------------- |
    | 역할 변경         | 가능          | 불가              | 불가     |                   |
    | Product 할당 변경 | 가능          | 자신의 Product 내 | 불가     |                   |
    | Operator 재배치   | 가능          | 자신의 Product 내 | 불가     | Product 단위 소속 |
    | 계정 비활성화     | 가능          | 불가              | 불가     |                   |
    ```mermaid
    %%권한 범위 요약
    flowchart TD

        GM["Group Manager"]
        PM["Product Manager"]
        OP["Operator"]

        subgraph Scope["접근 스코프"]
            G["Group 전체"]
            P["Product 단위"]
            R["Resource 단위 (Image, Feed)"]
        end

        GM --> G
        GM --> P
        GM --> R

        PM --> P
        PM --> R

        OP --> R

    ```
  - API단위 역할
    ```mermaid
    flowchart LR
        subgraph GroupLevel[그룹 단위]
            GL1["전체 Product 조회: GM(O), PM(X), OP(X)"]
            GL2["구성원 조회: GM(O)"]
            GL3["PM 생성/할당: GM(O)"]
            GL4["Operator 생성/할당: GM(O), PM(자신 Product만)"]
        end

        subgraph ProductLevel[상품 단위]
            PL1["Product 생성: GM(O), PM(O)"]
            PL2["Product 수정: GM(O), PM(자신 Product만)"]
            PL3["Product 삭제: GM(O), PM(자신 Product만)"]
            PL4["Product 조회: GM(O), PM(자신 Product), OP(할당 Product만)"]
        end

        subgraph ImageLevel[이미지 단위]
            IL1["업로드: GM/PM/OP 모두 가능"]
            IL2["조회: GM(O), PM(자신 Product), OP(할당 Product)"]
            IL3["수정: GM(O), PM(자신 Product), OP(본인 업로드만)"]
            IL4["삭제: GM(O), PM(자신 Product), OP(본인 업로드만)"]
        end

        subgraph FeedLevel[피드 단위]
            FL1["생성: GM/PM/OP 모두 가능"]
            FL2["수정: GM(O), PM(자신 Product), OP(본인 작성만)"]
            FL3["삭제: GM(O), PM(자신 Product), OP(본인 작성만)"]
            FL4["검수/승인: GM/PM 가능, OP 불가"]
        end

    ```
  ### 프로젝트 기획 흐름 (현실적 + 면접에서 설명하기 좋음)
  1. **조직 기반 접근 제어 설계**
     - 팀 단위 분리
     - 구성원 & 역할 정의
  2. **리소스 소유권(Ownership) 모델링**
     - 이미지, 상품, 피드마다 Owner를 둠
  3. **역할 기반 권한(Role-based Access)**
     - Manager / Product Manager / Operator
  4. **UI/서버 양단 접근 제어**
     - RoleGate 컴포넌트
     - server action level 권한 검사
     - Next.js middleware로 워크스페이스 보호
  5. **실험 환경**
     - mock role-selector (버튼으로 역할 전환)
  ***
  ### 기획이 부족했던 부분 개선 요약
  | 기존 고민                         | 개선된 기획                                                 |
  | --------------------------------- | ----------------------------------------------------------- |
  | 이미지 공유/삭제 규칙이 약간 억지 | 그룹 라이브러리 + Owner 삭제 제한으로 자연스러움            |
  | 상품 등록자 vs 운영자 관계가 애매 | Product Manager = 상품 owner, Operator는 콘텐츠 운영        |
  | RBAC 설명이 너무 포괄적           | org-level + role-level + ownership을 분리해 명확하게 구조화 |
  | 프로젝트 주제가 모호              | "콘텐츠·상품 운영 플랫폼"으로 선명화                        |
  ***
  ### 최종 추천 주제 문장 (포트폴리오)
  ```
  조직 기반 콘텐츠·상품 운영 플랫폼을 설계·구현.
  조직(Team), 역할(Role), 소유권(Ownership)을 결합한 접근 제어 모델을 만들고
  Next.js Middleware와 Server Actions에 일관된 권한 정책을 적용.
  Product Manager/Operator의 상품·콘텐츠 운영 워크플로우를 UI 레벨과 API 레벨에서 통합 제어.

  ```
  ***
  ### 초기 UI구조
  ***
  ### 1) 상단 바
  - 현재 역할(Role) 표시
  - 역할 변경 버튼(mock role selector)
  ### 2) 좌측 메뉴
  - 그룹 관리
  - 아이템 관리
  ### 3) 우측 컨텐츠
  - 그룹 관리
  - 아이템 관리 (2-column: 상품 리스트 / 상품 상세 → 이미지·피드)
  ***
  # 👍 전체적으로 **맞는 방향**이야
  RBAC 데모 앱에서 이 구조는 충분히 자연스러움.
  **BUT**, PM/Operator 권한 범위 고려하면
  지금 구조로는 몇 가지 애매한 점이 생겨.
  (특히 PM/OP는 “그룹 관리” 메뉴가 보이면 헷갈리고,
  아이템 관리도 “스코프 제한 UI”가 필요함)
  이걸 해결하면 훨씬 완성도가 높아져.
  ***
  # 🧩 1) 상단바 설계 — 이대로 하면 “완벽함”
  ### 구성
  | 요소            | 설명                                 |
  | --------------- | ------------------------------------ |
  | 현재 역할(Role) | “현재 역할: Product Manager A”       |
  | 소속 정보       | “소속 Product: Product 1, Product 2” |
  | 역할 스위처     | (Demo용) Role 변경 버튼              |
  | 사용자 정보     | Optional                             |
  ### 추천 개선
  “역할 + 소속” 정보를 한꺼번에 보여주면
  **Operator / PM의 스코프가 직관적으로 드러나서** 훨씬 자연스럽다.
  예시:
  ```
  [현재 역할: Product Manager A]
  [소유 Product: Product 1, Product 2]

  ```
  ***
  이렇게 하는 게 맞는 건지 잘 모르겠다. 좋으다 좋으다. 크리스마스 캐롤. 매우 좋죠
  # 🧩 2) 좌측 메뉴 — 메뉴 자체에 권한을 반영하면 훨씬 좋아짐
  너가 말한 구조:
  - 그룹 관리 → Root & Group Manager만 접근 가능
  - 아이템 관리 → 모든 역할 접근 가능
  여기서 개선하면:
  ### ✔ 메뉴 자체에서 "role gating" 적용
  - Root: 그룹관리 + 아이템관리
  - GM: 그룹관리 + 아이템관리
  - PM: 아이템관리만
  - OP: 아이템관리만
  ### ✔ UI에선 이렇게
  - 접근 불가 메뉴는 숨김 (disabled도 OK, but 숨김이 더 깔끔)
  - 메뉴 존재 여부만으로 role scope가 드러남
  이게 “시각적으로 권한 차등”을 드러내는 가장 직관적인 방식.
  ***
  # 🧩 3) 아이템 관리 UI — 지금보다 더 명확하게 정리된 구조
  너가 말한 구조를 조금 더 자연스럽게 바꿔서 이렇게 추천:
  ```
  아이템 관리 화면
  ├── 좌측: Product 목록
  │      - PM: 본인 Product만 보임
  │      - OP: 할당된 Product만 보임
  │      - GM: 모든 Product 보임
  │
  └── 우측: Product 상세
         ├── 상단: Product 기본 정보
         ├── 중단: 이미지 리스트
         └── 하단: 피드 리스트

  ```
  ### 중요한 점: **Product 스코프가 화면 구성에 그대로 반영됨**
  그래서:
  - PM끼리 서로의 Product는 UI에서도 절대 안 보임
  - OP는 할당 Product 하나만 보이고, 나머지 공간은 비워짐
  - GM은 모든 Product가 보임 → override 가능
  **이게 UI만으로도 권한 구조를 설명해주는 형태가 됨.**
  ***
  # 🧩 4) “이미지/피드”를 Product 상세의 탭으로 구성하면 더 자연스러움
  2column + 그 안에서 상/하 구조도 좋지만
  “탭”으로 바꾸면 훨씬 관리툴 느낌이 난다.
  예시:
  ```
  Product 상세
  [기본정보] [이미지] [피드]

  ```
  ### 왜 탭이 더 좋은가?
  - 이미지/피드가 서로 다른 리소스라 분리하는 게 자연스럽고
  - Operator는 이미지/피드 CRUD 중심이므로 이동이 빠름
  - PM/GM은 Product 관리/이미지/피드를 쉽게 오갈 수 있음
  너의 초기 구상도 좋지만, **탭으로 바꾸면 UX가 더 부드러움.**
  ***
  # 🧩 5) 그룹 관리 페이지 — RBAC 데모에서 엄청 중요한 지점
  구조 예시:
  ```
  그룹 관리
  ├── PM 목록 (추가/삭제)
  ├── Operator 목록 (추가/삭제/재배정)
  └── Product 목록 (PM 할당)

  ```
  여기서 GM/Root만 사용 가능.
  **PM/Operator는 이 메뉴 자체가 보이지 않음.**
  ***
  # 🧨 최종 정리 — UI 구조 (자연스럽고 이해 잘되는 버전)
  아래가 네 프로젝트에 가장 적합한 UI 구조야:
  ```
  [상단바]
  └─ 현재 역할 / 소속 Product / 역할 전환 버튼

  메인 화면
  ├─ 좌측 메뉴바
  │   ├─ 그룹 관리     (GM, Root)
  │   └─ 아이템 관리    (GM, PM, OP)
  │
  └─ 우측 내용
      ├─ 그룹 관리 (GM, Root)
      │   └─ PM/OP/상품/Operator 관리
      │
      └─ 아이템 관리
           ├─ 좌측: Product 목록
           │       (역할별 스코프 필터링)
           └─ 우측: Product 상세
                  ├─ 기본정보
                  ├─ 이미지 탭
                  └─ 피드 탭

  ```
  ***
  # 🔥 결론
  ### ✔ 네가 처음 제안한 구조는 충분히 좋은 방향
  ### ✔ 다만 역할별 스코프를 UI에 자연스럽게 녹이는 게 훨씬 중요
  ### ✔ 위처럼 “역할 → 메뉴 표시 → Product 스코프 → 상세 탭” 구조로 가면 완성도 매우 높아짐
  ### ✔ 포트폴리오에서 *매우 어필되는 설계*가 된다
  stitch로 디자인.

# 최종

아래는 너가 지금까지 말해준 요구사항 + 변경 제안안 + UI/기획 변화까지 **전체 프로젝트를 포트폴리오용 문서 형태로 완전히 정리한 최종 버전**이야.

면접/블로그/포트폴리오 어디에도 바로 넣을 수 있고,

문장도 자연스럽고 전문적인 톤으로 맞춰서 구성해놓았다.

---

# 1. 프로젝트 설명 (Project Overview)

**조직 기반 콘텐츠·상품 운영 플랫폼**을 설계·구현한 미니 프로젝트이다.

접근 제어를 단순 Role에만 맡기는 방식에서 확장해,

**조직(Team) → 역할(Role) → 소유권(Ownership) → 리소스 스코프(Resource Scope)**

이 네 가지 축으로 접근을 제한하는 **고급 RBAC + Scoped Ownership 모델**을 구현했다.

Next.js Middleware와 Server Actions에 동일한 권한 정책을 적용하여

UI와 API(서버 액션) 모두에서 **일관된 접근 제어 흐름**을 유지한다.

이 프로젝트는 실제 서비스에서 자주 문제되는

_“누가 어떤 자원에 접근할 수 있어야 하는가?”_

에 대한 실무형 해결 과정을 담고 있으며,

대규모 멀티 테넌시 SaaS에서 실제로 사용하는 구조를 축소해 만든 형태이다.

---

# 2. 기획 의도 (Design Intent)

실제 전 회사에서 다뤘던 조직 기반 권한 시스템에서 느낀 한계를 해결하고자 기획했다.

기존 문제는 다음과 같았다:

- PM(Product Manager)과 Operator 간 권한 범위가 애매함
- 이미지/콘텐츠의 소유권, 삭제 권한, 재사용 권한이 명확하지 않음
- 같은 그룹 내에서도 PM끼리 자원 공유를 제한해야 했음
- UI 접근 가능 범위와 서버 권한 검증이 일치하지 않아 오류가 잦음

이를 해결하기 위해 다음 원칙을 도입:

1. **역할(Role) 기반 권한 + Product 단위 소유권(Ownership)을 결합한다.**
2. **PM별 스코프 분리를 유지한다.** (PM 간 자원 공유 없음)
3. **Operator는 Product 단위로 배정되고 그 범위 내에서만 작업한다.**
4. **이미지·피드 등 리소스는 Product 소속이 아닌 “도메인 레벨”로 분리하고,
   Product는 해당 리소스를 참조하는 방식으로 확장성을 고려한다.**

---

# 3. 전체 기획 내용 (Planning Summary)

## 3-1. 핵심 도메인 구조

- **Group**
  - 하나의 Group Manager(GM)
  - 여러 Product Manager(PM)
  - 여러 Operator(OP)
- **Product**
  - 하나의 Product Owner(PM)
  - 여러 Operator가 배정될 수 있음
  - 여러 이미지(참조)
  - 여러 피드(참조 or 종속)
- **Image Library (PM-level Scoped)**
  - 이미지 자체는 상품에 종속되지 않음
  - PM 단위로 격리된 이미지 라이브러리
  - Product는 “이미지 선택” 형태로 참조
  - Operator도 PM 소유 이미지에만 접근 가능
- **Feed (Product-level Resource)**
  - 재사용 성이 낮아 Product 내부에 두는 것이 더 자연스러움
  - 생성/수정/삭제는 Ownership 기반으로 제한

---

# 4. 권한 구조 테이블 (Permission Matrix)

## 4-1. 역할 요약

| 역할                | 권한 범위                                              | 설명                                  |
| ------------------- | ------------------------------------------------------ | ------------------------------------- |
| **Root**            | 전체                                                   | 모든 그룹/상품/리소스 관리            |
| **Group Manager**   | 그룹 단위                                              | PM/OP/상품/이미지 관리                |
| **Product Manager** | 자신이 소유한 Product + 자신의 이미지 라이브러리       | Product Owner                         |
| **Operator**        | 할당된 Product + PM 이미지 라이브러리 조회/업로드 일부 | 생성 중심, 수정/삭제는 Ownership 기반 |

---

## 4-2. 주요 기능 권한 매트릭스

### Group Level

| 기능           | Root | GM  | PM  | OP  |
| -------------- | ---- | --- | --- | --- |
| 그룹 관리      | O    | O   | X   | X   |
| PM/OP 관리     | O    | O   | X   | X   |
| 상품 생성/삭제 | O    | O   | X   | X   |

---

### Product Level

| 기능         | Root | GM  | PM             | OP             |
| ------------ | ---- | --- | -------------- | -------------- |
| Product 생성 | O    | X   | O              | X              |
| Product 수정 | O    | O   | 본인 Product만 | X              |
| Product 삭제 | O    | O   | 본인 Product만 | X              |
| Product 조회 | O    | O   | 본인 Product   | 할당 Product만 |

---

### Image Library (PM-level)

| 기능                  | Root | GM  | PM            | OP            |
| --------------------- | ---- | --- | ------------- | ------------- |
| 이미지 업로드         | O    | O   | O             | O             |
| 이미지 조회           | O    | O   | 본인(PM)      | PM 이미지만   |
| 이미지 수정           | O    | O   | 본인 이미지만 | 본인 업로드만 |
| 이미지 삭제           | O    | O   | 본인 이미지만 | 본인 업로드만 |
| Product에 이미지 연결 | O    | O   | O             | X             |

---

### Feed (Product-level Resource)

| 기능      | Root | GM  | PM           | OP          |
| --------- | ---- | --- | ------------ | ----------- |
| 피드 생성 | O    | O   | O            | O           |
| 피드 수정 | O    | O   | 본인 Product | 본인 작성만 |
| 피드 삭제 | O    | O   | 본인 Product | 본인 작성만 |

---

# 5. UI 구성 (UI Structure)

UI는 “역할에 따른 접근 영역이 자연스럽게 드러나는 구조”로 설계한다.

## 5-1. Top Bar

- 현재 사용자 역할(Role)
- 소속 Product 리스트 (PM/OP만 표시)
- Role Switcher (Demo용)

예)

`Current Role: Product Manager A`

`Products: Product 1, Product 2`

---

## 5-2. 메인 레이아웃

### Left Sidebar 메뉴

- **Group Management**
  - Root, GM만 표시
- **Item Management**
  - Root, GM, PM, OP 전체 표시

### Right Content Area

### 1) Group Management (Root / GM 전용)

- Product Manager 목록
- Operator 목록
- Products 목록 + PM 할당
- Operator → Product 배정

### 2) Item Management

2-Column 구조:

```
왼쪽: Product 리스트
  - Root/GM → 전체 Product 노출
  - PM → 본인 Product만
  - OP → 배정된 Product만

오른쪽: Product 상세
  - 기본 정보
  - Images 탭 (Image Library에서 선택/등록)
  - Feed 탭 (Product 소유 피드 표시)

```

---

# 6. 변경 제안안 반영 요약

### 이미지 도메인 독립화

- 기존: Product 소속
- 변경: **PM 소유 Image Library 도입**
- Product는 이미지 선택하여 참조
- Operator도 PM 라이브러리 내에서만 작업 가능

**이점:**

- 여러 상품이 동일 이미지를 공유 가능
- 관리 효율 상승
- 스코프 분리(PM별 Library)도 유지 가능

---

### 피드는 그대로 Product 내부 리소스로 유지

이유:

- 피드는 재활용성이 거의 없음
- 상품 캠페인·설명·혜택 등 Product-specific
- 이미지처럼 cross-product 공유할 필요가 없음

그래서 기획상 **Feed = Product 종속 리소스**가 가장 자연스럽다.

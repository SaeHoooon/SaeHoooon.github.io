window.lectureData = window.lectureData || {};
window.lectureData["L9S"] = `
<div class="lec-hero">
  <div class="hero-badge">Lecture 9 · Summary</div>
  <h1 class="hero-title">Virtual Memory — 동기 · 주소 변환 · TLB</h1>
  <p class="hero-sub">Lec 9-1 + 9-2 핵심 개념 · 공식 · 계산법 총정리</p>
  <div class="hero-meta">
    <span>📚 Computer Architecture Module 3</span>
    <span>🗂️ Lec 9-1 · 9-2 통합 정리</span>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 1</span>
    <h2>Virtual Memory의 3가지 목적</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>목적 ① DRAM을 Disk의 Cache로 사용</h4>
      <p>
        프로그램이 physical memory(DRAM)보다 큰 address space를 사용할 수 있게 한다.<br><br>
        <strong>동기</strong>:<br>
        • 32-bit: ~4GB 주소 공간 / 64-bit: ~16 quintillion bytes<br>
        • DRAM은 Disk보다 약 30배 비싸다 ($400 for 256MB DRAM vs $400 for 8GB Disk)<br>
        • 해결: 전체 데이터를 Disk에 두고, 당장 필요한 page만 DRAM에 올림<br><br>
        <strong>동작 원리</strong>:<br>
        프로그램은 큰 virtual address space를 쓰는 것처럼 보이지만, 실제 DRAM에는 현재 필요한 page만 존재. OS와 hardware가 자동 관리.
      </p>
    </div>
    <div class="explain">
      <h4>목적 ② Memory Management (메모리 공유)</h4>
      <p>
        여러 process가 physical memory를 안전하고 효율적으로 공유하게 한다.<br><br>
        • 각 process에게 독립적인 virtual address space 제공 (0~N-1)<br>
        • 두 process가 같은 virtual address를 사용해도 다른 physical address로 mapping<br>
        • Read-only library code는 여러 process가 같은 physical page를 공유 가능 → 효율적<br>
        • 예: 두 process 모두 stack address 0x11fffff80 사용 → Virtual Memory가 다른 PP로 분리
      </p>
    </div>
    <div class="explain">
      <h4>목적 ③ Protection (접근 보호)</h4>
      <p>
        Page Table Entry(PTE)의 access rights 필드로 각 page의 접근 권한을 제어한다.<br><br>
        • <strong>Read</strong>: 읽기 가능 여부<br>
        • <strong>Write</strong>: 쓰기 가능 여부<br>
        • <strong>Execute</strong>: 실행 가능 여부<br>
        • <strong>User/Kernel</strong>: 권한 레벨<br><br>
        Code page: Read+Execute만 허용, Write 금지<br>
        다른 process의 page: 접근 시 protection fault (OS trap)<br>
        Kernel space: user mode에서 접근 불가
      </p>
    </div>
    <div class="key">
      💡 Virtual Memory의 3대 목적: ① DRAM을 Disk의 cache로 (큰 address space) ② 독립적 address space (프로세스 격리) ③ Protection (하드웨어 수준 보안)
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 2</span>
    <h2>Cache vs Virtual Memory — 계층 비교</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>같은 원리, 다른 계층에 적용</h4>
      <p>
        <strong>SRAM Cache</strong>: DRAM을 위한 cache<br>
        • SRAM vs DRAM 속도 차: 약 10배<br>
        • Miss (cache miss): 수십~수백 cycles<br>
        • Block size: 수십 bytes (32~128B)<br>
        • 위치 탐색: Tag 직접 비교 (hardware)<br>
        • Placement: Direct-mapped / Set-Associative<br><br>
        <strong>Virtual Memory (DRAM)</strong>: Disk를 위한 cache<br>
        • DRAM vs Disk 속도 차: 약 100,000배 (!!!)<br>
        • Miss (page fault): 수백만 cycles (OS 개입)<br>
        • Block size (page): 수KB~수MB (4KB 일반적)<br>
        • 위치 탐색: Page Table을 통한 indirect lookup<br>
        • Placement: Fully Associative (어느 physical page에나)
      </p>
    </div>
    <div class="callout">
      ⚠️ Page fault는 cache miss보다 비용이 약 100,000배 더 크다. 따라서 virtual memory 설계에서 page fault(miss) rate 최소화가 절대적으로 중요하다. 이것이 virtual memory가 Fully Associative를 사용하는 이유!
    </div>
    <div class="explain">
      <h4>Virtual Memory를 Cache 파라미터로 분석</h4>
      <p>
        <strong>Line size → Page size</strong>: 큰 단위 사용 (4KB~4MB)<br>
        이유: Disk 첫 byte 접근 비용이 극단적으로 크므로 한 번에 큰 단위로 가져오는 것이 효율적<br><br>
        <strong>Associativity → Fully Associative</strong><br>
        이유: Page fault penalty가 너무 크므로 conflict를 최대한 줄여야 함<br><br>
        <strong>Replacement Policy → LRU 근사</strong><br>
        이유: Page fault penalty가 크므로 좋은 replacement가 중요<br><br>
        <strong>Write Policy → Write-Back</strong><br>
        이유: Disk에 즉시 쓰면 (write-through) 너무 느리므로, evict 시에만 씀
      </p>
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 3</span>
    <h2>Virtual Address 구조와 변환 공식</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>주소 구조</h4>
      <p>
        <strong>Virtual Address</strong>:<br>
        <code style="font-size:1em; background:#e8f0fe; padding:3px 8px; border-radius:4px; display:inline-block;">
          | Virtual Page Number (VPN) | Page Offset |
        </code><br><br>
        <strong>Physical Address</strong>:<br>
        <code style="font-size:1em; background:#e8f5e9; padding:3px 8px; border-radius:4px; display:inline-block;">
          | Physical Page Number (PPN) | Page Offset |
        </code><br><br>
        <strong>핵심: Page Offset은 변하지 않는다!</strong><br>
        Virtual page와 Physical page의 크기가 같으므로, page 내부의 위치(offset)는 translation 과정에서 그대로 복사된다. 오직 VPN → PPN 변환만 일어난다.
      </p>
    </div>
    <div class="key">
      💡 <strong>주소 분할 공식</strong><br>
      Page size = P = 2<sup>p</sup> bytes → Page offset = p bits<br>
      Virtual address = n bits → VPN = n − p bits<br>
      Physical address = m bits → PPN = m − p bits<br>
      (n ≠ m 가능: Virtual address space ≠ Physical address space)
    </div>
    <div class="explain">
      <h4>계산 예시: 43-bit VA, 26-bit PA, 8KB page</h4>
      <p>
        Page size = 8KB = 2<sup>13</sup> → offset = <strong>13 bits</strong><br>
        VPN bits = 43 − 13 = <strong>30 bits</strong><br>
        PPN bits = 26 − 13 = <strong>13 bits</strong><br><br>
        가능한 Virtual page 수 = 2<sup>30</sup><br>
        가능한 Physical page 수 = 2<sup>13</sup> = 8192
      </p>
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 4</span>
    <h2>Page Table 구조와 Address Translation 절차</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>Page Table Entry (PTE) 구성</h4>
      <p>
        각 PTE에 포함되는 정보:<br>
        • <strong>Valid bit</strong>: 1이면 page가 DRAM에 있음. 0이면 page fault!<br>
        • <strong>Physical Page Number (PPN)</strong>: 실제 physical memory의 page 번호<br>
        • <strong>Access Rights</strong>: read/write/execute 권한<br>
        • <strong>Dirty bit</strong>: page가 수정되었는지 (write-back 결정용)<br>
        • <strong>Referenced bit</strong>: 최근 접근 여부 (LRU 근사용)
      </p>
    </div>
    <div class="explain">
      <h4>Address Translation 절차 (Page Table 이용)</h4>
      <p>
        1. Virtual address에서 VPN과 Page Offset 분리<br>
        2. <strong>Page Table Base Register</strong>가 page table 시작 주소를 가리킴<br>
        3. VPN을 <strong>table index</strong>로 사용하여 해당 PTE 조회<br>
        4. PTE의 <strong>Valid bit 확인</strong><br>
           &nbsp;&nbsp;&nbsp;&nbsp;• Valid = 1: PPN 추출 → Physical address = PPN + Offset<br>
           &nbsp;&nbsp;&nbsp;&nbsp;• Valid = 0: <strong>Page Fault!</strong> OS trap handler 실행<br>
        5. Access Rights 확인 → violation이면 protection fault<br>
        6. Physical address로 Cache 조회
      </p>
    </div>
    <div class="callout">
      ⚠️ Page Table 자체가 메모리에 있으므로, 매 메모리 접근마다 page table 조회를 위한 추가 메모리 접근이 필요하다. 이것이 TLB가 필요한 이유!
    </div>
    <div class="explain">
      <h4>Single-Level Page Table 크기 계산</h4>
      <p>
        Page table 크기 = 2<sup>VPN bits</sup> × PTE size<br><br>
        예: 43-bit VA, 8KB page, PTE = 8 bytes<br>
        → VPN bits = 30 → page table = 2<sup>30</sup> × 8 = 2<sup>33</sup> bytes = <strong>8 GB</strong><br><br>
        실제 heap 사용량이 8MB에 불과해도 page table은 8GB를 점유한다!<br>
        → Single-level page table의 비효율성<br>
        → 해결: Multi-level page table (Hierarchical page table)
      </p>
    </div>
    <div class="key">
      💡 Page table 크기 공식: 2<sup>(VA bits − page offset bits)</sup> × PTE size<br>
      VPN이 크면 page table이 폭발적으로 커진다!
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 5</span>
    <h2>TLB (Translation Lookaside Buffer) — Page Table의 Cache</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>TLB란?</h4>
      <p>
        TLB = Page Table의 Cache. 최근 사용한 PTE를 저장하는 작고 빠른 메모리.<br><br>
        <strong>TLB 특성</strong>:<br>
        • 크기: 보통 16~512 entries (매우 작음)<br>
        • 구조: Fully Associative 또는 high-way set associative<br>
        • 저장 내용: VPN → PPN mapping + access rights + dirty bit 등<br><br>
        <strong>TLB Hit</strong>: Page table 접근 없이 즉시 PPN 획득 → 매우 빠름<br>
        <strong>TLB Miss</strong>: Page table에서 PTE를 읽어 TLB에 저장 후 재시도
      </p>
    </div>
    <div class="explain">
      <h4>TLB를 포함한 전체 데이터 접근 흐름</h4>
      <p>
        <strong>Step 1</strong>: CPU가 Virtual Address(VA) 생성<br>
        <strong>Step 2</strong>: VA → VPN + Page Offset 분리<br>
        <strong>Step 3</strong>: VPN으로 TLB 조회<br>
        &nbsp;&nbsp;&nbsp;&nbsp;→ <strong>TLB Hit</strong>: PPN 즉시 획득<br>
        &nbsp;&nbsp;&nbsp;&nbsp;→ <strong>TLB Miss</strong>: Page table에서 PTE 읽어 TLB 갱신 → PPN 획득<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Page table에도 없으면 → Page Fault)<br>
        <strong>Step 4</strong>: Physical Address = PPN + Page Offset 생성<br>
        <strong>Step 5</strong>: PA로 Cache 조회<br>
        &nbsp;&nbsp;&nbsp;&nbsp;→ <strong>Cache Hit</strong>: Data 반환<br>
        &nbsp;&nbsp;&nbsp;&nbsp;→ <strong>Cache Miss</strong>: Main Memory에서 block 로드 후 반환
      </p>
    </div>
    <div class="callout">
      ⚠️ TLB hit/miss와 Cache hit/miss는 완전히 독립적이다!<br>
      TLB miss가 나도 Cache hit 가능 / TLB hit이 나도 Cache miss 가능<br>
      TLB = "주소 변환 성공 여부" / Cache = "실제 데이터가 있는지 여부"
    </div>
    <div class="key">
      💡 <strong>4가지 조합</strong><br>
      TLB hit + Cache hit: 최선 (가장 빠름)<br>
      TLB hit + Cache miss: 메모리 접근 필요<br>
      TLB miss + Cache hit: Page table 접근 후 cache에서 data<br>
      TLB miss + Cache miss + Page fault: 최악 (disk까지)
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 6</span>
    <h2>TLB Miss 계산 — 연습 문제 완전 풀이</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>문제 설정: Page size = 2KB, TLB 8 entries (FIFO), int A[2560]</h4>
      <p>
        int = 4 bytes<br>
        A 배열 총 크기 = 2560 × 4 = <strong>10,240 bytes = 10 KB</strong><br>
        Page size = 2 KB → 필요한 page 수 = 10KB ÷ 2KB = <strong>5 pages</strong><br>
        TLB 크기 = 8 entries → 5개 page 모두 동시에 보유 가능
      </p>
    </div>
    <div class="explain">
      <h4>Q1: 순차 접근 (for i=0; i&lt;2560; i++)</h4>
      <p>
        각 page에 처음 접근할 때만 TLB miss → page당 1 miss<br>
        A[0]~A[511]: page 0 → miss 1번 (이후 A[1]~A[511]은 hit)<br>
        A[512]~A[1023]: page 1 → miss 1번<br>
        ...<br>
        총 <strong>TLB miss = 5번</strong>
      </p>
    </div>
    <div class="explain">
      <h4>Q2: 5회 반복, i+=2 (for k=0; k&lt;5; k++) (for i=0; i&lt;N; i+=2)</h4>
      <p>
        i가 2씩 증가해도 A[0]~A[5118] 범위 전체를 방문 → 여전히 5개 page 필요<br>
        k=0일 때: 5 pages 처음 방문 → <strong>5 TLB misses</strong><br>
        k=1,2,3,4: TLB에 5개 page가 남아있음 (TLB 8 entries > 5 pages) → 모두 hit<br>
        총 <strong>TLB miss = 5번</strong>
      </p>
    </div>
    <div class="key">
      💡 <strong>TLB Miss 계산 핵심 공식</strong><br>
      TLB miss 수 = min(unique pages 수, TLB capacity) × (TLB이 working set을 보유하지 못하는 경우 반복)<br>
      TLB가 working set을 모두 담을 수 있으면 → 첫 loop에서만 miss, 이후 모두 hit
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 7</span>
    <h2>Page Fault 처리 과정</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>Page Fault 발생 및 처리 절차</h4>
      <p>
        <strong>1. CPU가 Virtual Address 접근</strong><br>
        <strong>2. Page Table 조회 → Valid = 0</strong> (page가 DRAM에 없음)<br>
        <strong>3. Page Fault exception 발생</strong> → OS trap handler 실행<br>
        <strong>4. OS가 disk에서 해당 page 위치 확인</strong><br>
        <strong>5. I/O Controller에 disk read 요청</strong><br>
        <strong>6. DMA Transfer</strong>: I/O controller가 CPU 개입 없이 disk → DRAM으로 직접 전송<br>
        <strong>7. I/O 완료 Interrupt</strong>: controller가 CPU에 신호<br>
        <strong>8. OS가 Page Table 갱신</strong> (Valid=1, PPN 업데이트)<br>
        <strong>9. 중단된 process 재개</strong>, 해당 명령어부터 다시 실행
      </p>
    </div>
    <div class="key">
      💡 DMA(Direct Memory Access): CPU가 byte 하나하나 복사하지 않고, I/O controller가 직접 disk → DRAM으로 데이터 이동. CPU는 다른 작업 수행 가능(multitasking).
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 8</span>
    <h2>Lec 9 전체 연결 맵 — Cache와 Virtual Memory의 유사성</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>Cache와 Virtual Memory의 완벽 대응 관계</h4>
      <p>
        <table style="width:100%; border-collapse:collapse; font-size:0.95em;">
          <tr style="background:#e8f0fe; font-weight:700;">
            <td style="padding:6px 10px; border:1px solid #c5cae9;">개념</td>
            <td style="padding:6px 10px; border:1px solid #c5cae9;">SRAM Cache</td>
            <td style="padding:6px 10px; border:1px solid #c5cae9;">Virtual Memory</td>
          </tr>
          <tr>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">빠른 계층</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">SRAM Cache</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">DRAM (Main Memory)</td>
          </tr>
          <tr style="background:#fafafa;">
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">느린 계층</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">DRAM</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Disk</td>
          </tr>
          <tr>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">이동 단위</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Cache line (32~128B)</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Page (4KB~)</td>
          </tr>
          <tr style="background:#fafafa;">
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Miss</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Cache miss</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Page fault</td>
          </tr>
          <tr>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Miss 비용</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">수십~수백 cycles</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">수백만 cycles</td>
          </tr>
          <tr style="background:#fafafa;">
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">위치 탐색</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Tag 직접 비교</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Page Table (indirect)</td>
          </tr>
          <tr>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Placement</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Direct/Set-Assoc</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Fully Associative</td>
          </tr>
          <tr style="background:#fafafa;">
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Write policy</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Write-through/back</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Write-Back (dirty bit)</td>
          </tr>
          <tr>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Cache 가속</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">—</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">TLB (Page table cache)</td>
          </tr>
          <tr style="background:#fafafa;">
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Miss 처리</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">Hardware</td>
            <td style="padding:6px 10px; border:1px solid #e0e0e0;">OS (Software)</td>
          </tr>
        </table>
      </p>
    </div>
    <div class="explain">
      <h4>전체 데이터 접근 흐름 (TLB + Cache + DRAM + Disk)</h4>
      <p>
        CPU VA 생성<br>
        → <strong>[TLB 조회]</strong><br>
        &nbsp;&nbsp;&nbsp;&nbsp;TLB hit → PPN 획득<br>
        &nbsp;&nbsp;&nbsp;&nbsp;TLB miss → <strong>[Page Table 조회]</strong><br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Valid=1 → PPN 획득 + TLB 갱신<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Valid=0 → <strong>Page Fault</strong> → OS → Disk → DRAM 로드<br>
        → PA = PPN + Offset<br>
        → <strong>[Cache 조회]</strong><br>
        &nbsp;&nbsp;&nbsp;&nbsp;Cache hit → Data 반환<br>
        &nbsp;&nbsp;&nbsp;&nbsp;Cache miss → DRAM에서 block 로드 → Data 반환
      </p>
    </div>
    <div class="key">
      💡 <strong>시험 직전 체크리스트</strong><br>
      □ Virtual Memory의 3가지 목적 설명 가능한가?<br>
      □ VA → PA 변환 공식 (VPN + offset → PPN + offset) 이해했는가?<br>
      □ Page offset이 변하지 않는 이유 설명 가능한가?<br>
      □ Page table 크기 계산 (2^VPN bits × PTE size) 가능한가?<br>
      □ TLB hit/miss와 Cache hit/miss가 독립적임을 이해했는가?<br>
      □ TLB miss 수 계산 방법 알고 있는가?<br>
      □ Page fault 처리 절차 (DMA 포함) 순서대로 설명 가능한가?<br>
      □ Cache와 Virtual Memory의 대응 관계 표 설명 가능한가?
    </div>
  </div>
</div>
`;

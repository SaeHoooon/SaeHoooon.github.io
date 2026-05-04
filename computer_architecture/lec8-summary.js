window.lectureData = window.lectureData || {};
window.lectureData["L8S"] = `
<div class="lec-hero">
  <div class="hero-badge">Lecture 8 · Summary</div>
  <h1 class="hero-title">Set Associative Caches & Cache Parameters</h1>
  <p class="hero-sub">Lec 8-1 + 8-2 핵심 개념 · 공식 · 계산법 총정리</p>
  <div class="hero-meta">
    <span>📚 Computer Architecture Module 3</span>
    <span>🗂️ Lec 8-1 · 8-2 통합 정리</span>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 1</span>
    <h2>Cache Placement Policy 3가지 비교</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>3가지 배치 방식 완전 비교</h4>
      <p>
        <strong>① Direct-Mapped</strong><br>
        각 memory block → 정확히 1개의 cache line에만 매핑<br>
        배치 공식: cache index = block number <strong>mod</strong> (number of cache blocks)<br>
        예: cache 8 blocks, block 12 → 12 mod 8 = <strong>4</strong>번 line에만 들어갈 수 있음<br>
        Comparator: 1개 / Conflict miss: 심각 / Hardware: 단순<br><br>
        <strong>② N-way Set Associative</strong><br>
        Cache를 S개 set으로 분할, 각 set 안에 N개 entry<br>
        배치 공식: set index = block number <strong>mod</strong> (number of sets)<br>
        예: 2-way, 4 sets, block 12 → 12 mod 4 = set <strong>0</strong>의 2개 entry 중 하나<br>
        Comparator: N개 / Conflict miss: 중간 / Hardware: 중간<br><br>
        <strong>③ Fully Associative</strong><br>
        block이 cache의 <strong>어느 entry에나</strong> 들어갈 수 있음<br>
        Set index 없음. 주소 = Tag + Offset<br>
        Comparator: entry 수만큼 / Conflict miss: 없음 / Hardware: 비쌈
      </p>
    </div>
    <div class="key">
      💡 <strong>Set 수 계산 공식</strong><br>
      Number of Sets = Total Cache Blocks ÷ N (way 수)<br>
      예: 총 1024 blocks, 2-way → Sets = 512, Index = log₂(512) = 9 bits
    </div>
    <div class="explain">
      <h4>Associativity에 따른 주소 분할 변화</h4>
      <p>
        64KB Cache, 64B block (offset = 6 bits), 32-bit address 기준:<br><br>
        Direct-Mapped: 1024 blocks → index = 10 bits, tag = 16 bits<br>
        2-way Set Assoc: 512 sets → index = 9 bits, tag = 17 bits<br>
        4-way Set Assoc: 256 sets → index = 8 bits, tag = 18 bits<br>
        Fully Assoc: 0 index bits → tag = 26 bits
      </p>
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 2</span>
    <h2>Associativity 비교 예시 — 5 accesses 분석</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>Access sequence: 0, 8, 0, 6, 8 (4-block cache)</h4>
      <p>
        <strong>Direct-Mapped (index = block mod 4)</strong><br>
        0→index 0, 8→index 0, 0→index 0, 6→index 2, 8→index 0<br>
        0과 8이 index 0 충돌 → 서로 계속 쫓아냄<br>
        결과: 5번 모두 miss → <strong>Miss rate 100%</strong><br><br>
        <strong>2-way Set Associative (set = block mod 2, 2 sets)</strong><br>
        0→set 0, 8→set 0, 0→set 0, 6→set 0, 8→set 0 (전부 set 0이지만 entry 2개!)<br>
        0과 8이 set 0 안에 공존 가능<br>
        결과: 접근 0→miss, 8→miss, 0→<strong>hit</strong>, 6→miss(교체), 8→miss<br>
        총 <strong>4 misses</strong><br><br>
        <strong>Fully Associative (4 entries, 어디든 가능)</strong><br>
        0, 8, 6이 동시에 cache에 존재 가능<br>
        결과: 0→miss, 8→miss, 0→<strong>hit</strong>, 6→miss, 8→<strong>hit</strong><br>
        총 <strong>3 misses</strong>
      </p>
    </div>
    <div class="key">
      💡 Associativity ↑ → Miss 수 감소: Direct(5) > 2-way(4) > Fully(3)<br>
      하지만 Diminishing Returns: 1→2 way 효과 >> 4→8 way 효과
    </div>
    <div class="explain">
      <h4>실제 Miss Rate 수치 (SPEC2000, 64KB D-cache, 16-word block)</h4>
      <p>
        1-way: <strong>10.3%</strong><br>
        2-way: <strong>8.6%</strong> (감소 1.7%p)<br>
        4-way: <strong>8.3%</strong> (감소 0.3%p)<br>
        8-way: <strong>8.1%</strong> (감소 0.2%p)<br><br>
        → 2-way에서 대부분의 이익을 얻는다. 그 이상은 hardware cost 증가 대비 효과가 미미하다.
      </p>
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 3</span>
    <h2>Cache 구현 — Hardware 구조 비교</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>3가지 Cache 구현 방식 비교</h4>
      <p>
        <strong>Direct-Mapped</strong><br>
        ① Index → 특정 line 선택<br>
        ② Tag 비교 (comparator 1개)<br>
        ③ Valid 확인 → Hit 판단<br>
        ④ Offset으로 data 선택<br>
        특징: 가장 단순, comparator 1개, mux 불필요<br><br>
        <strong>2-Way Set Associative</strong><br>
        ① Index → set 선택<br>
        ② Way 0, Way 1의 Tag를 <strong>동시에(병렬로)</strong> 비교 (comparator 2개)<br>
        ③ 어느 way가 hit인지 확인<br>
        ④ Mux로 hit한 way의 data 선택<br>
        특징: comparator 2개, mux 필요<br><br>
        <strong>Fully Associative</strong><br>
        ① 모든 entry의 Tag를 동시에 비교 (comparator = entry 수)<br>
        ② Hit한 entry의 data 선택<br>
        특징: index 없음, entry 수만큼 comparator 필요 → 매우 비쌈<br>
        실용: TLB처럼 entry 수가 적을 때만 사용
      </p>
    </div>
    <div class="key">
      💡 Direct-Mapped: 1 comparator (빠름/쌈) → 2-way: 2 comparators → Fully Assoc: N comparators (느림/비쌈)<br>
      Miss rate는 반대 방향으로 개선됨
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 4</span>
    <h2>AMAT 공식 — Cache 성능의 핵심 지표</h2>
  </div>
  <div class="sec-body">
    <div class="key">
      💡 <strong>AMAT (Average Memory Access Time) 공식</strong><br>
      <code style="font-size:1.1em;">AMAT = Hit time + Miss rate × Miss penalty</code><br><br>
      성능 향상 3가지 방향:<br>
      ① Hit time 줄이기 (Cache를 작고 단순하게)<br>
      ② Miss rate 줄이기 (Cache size ↑, Associativity ↑, Block size 최적화)<br>
      ③ Miss penalty 줄이기 (L2 cache 추가, 더 빠른 메모리)
    </div>
    <div class="explain">
      <h4>AMAT 계산 예시</h4>
      <p>
        L1 hit time = 1 cycle, Miss rate = 5%, Miss penalty = 100 cycles<br>
        AMAT = 1 + 0.05 × 100 = <strong>6 cycles</strong><br><br>
        L2 추가 후: L1 miss → L2 확인 (5 cycles), L2 miss rate = 0.5%, DRAM = 100 cycles<br>
        L1 AMAT = 1 + 0.05 × (5 + 0.005 × 100) = 1 + 0.05 × 5.5 = <strong>1.275 cycles</strong>
      </p>
    </div>
    <div class="explain">
      <h4>Multilevel Cache Miss Rate 용어 구분</h4>
      <p>
        <strong>Local miss rate</strong>: 해당 cache에 들어온 access 중 miss 비율<br>
        = (해당 cache misses) / (해당 cache accesses)<br><br>
        <strong>Global miss rate</strong>: CPU 전체 memory access 중 miss 비율<br>
        = (해당 cache misses) / (CPU total memory accesses)<br><br>
        예: L1 miss rate = 5%, L2 local miss rate = 10%<br>
        → L2 global miss rate = 5% × 10% = <strong>0.5%</strong><br><br>
        <strong>Misses per instruction</strong>: 명령어당 miss 수
      </p>
    </div>
    <div class="callout">
      ⚠️ Local miss rate와 Global miss rate를 혼동하지 말 것! L2 local miss rate는 항상 L2 global miss rate보다 높다 (L1이 hit를 걸러낸 후 L2에 오는 것만 받으므로).
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 5</span>
    <h2>3C Miss 완전 분류</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>Cache Miss의 3C 분류</h4>
      <p>
        <strong>① Compulsory Miss (Cold Miss)</strong><br>
        정의: 해당 block에 처음 접근할 때 발생<br>
        특징: Cache가 무한히 커도, 어떤 교체 정책을 써도 피할 수 없음<br>
        감소 방법: Block size 증가 (spatial locality로 첫 접근 시 더 많이 가져옴)<br><br>
        <strong>② Capacity Miss</strong><br>
        정의: Cache가 프로그램의 working set을 모두 담기에 너무 작아서 발생<br>
        특징: Fully Associative로 만들어도 cache size가 작으면 발생<br>
        감소 방법: Cache size 증가<br><br>
        <strong>③ Conflict Miss</strong><br>
        정의: Block placement 제한(limited associativity) 때문에 발생<br>
        특징: Fully Associative였다면 발생하지 않았을 miss<br>
        감소 방법: Associativity 증가
      </p>
    </div>
    <div class="explain">
      <h4>코드 예시로 3C 구분하기</h4>
      <p>
        배열 A[20], B[20], 4 words/block (Blk-0~Blk-4):<br><br>
        <code>for(i=0~19) A[i]=const;</code><br>
        → A는 5 blocks. 처음 접근 → <strong>5 Compulsory Miss</strong><br><br>
        <code>for(j=0~1) for(i=0~19) A[i]=const;</code><br>
        → 두 번째 loop에서 cache가 5 blocks를 모두 담기에 너무 작으면 → <strong>Capacity Miss</strong><br><br>
        <code>for(i=0~19) A[i]=B[i];</code> (A와 B가 같은 cache block boundary에 mapping)<br>
        → A와 B가 서로를 쫓아냄 → <strong>Conflict Miss</strong> (5×6 = 30 misses)
      </p>
    </div>
    <div class="key">
      💡 <strong>3C 구분 질문</strong><br>
      이 block에 처음 접근인가? → Compulsory<br>
      Cache가 너무 작아서인가? (fully assoc에서도 발생) → Capacity<br>
      Mapping 충돌 때문인가? (fully assoc이면 안 났을) → Conflict
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 6</span>
    <h2>Cache Parameter 변화의 Trade-off 총정리</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>각 파라미터 변화가 성능에 미치는 영향</h4>
      <p>
        <strong>Cache Size 증가 ↑</strong><br>
        Capacity Miss ↓ · Conflict Miss ↓<br>
        Hit time ↑ (물리적으로 큰 구조 탐색)<br><br>
        <strong>Associativity 증가 ↑</strong><br>
        Conflict Miss ↓<br>
        Hit time ↑ · Hardware cost ↑ (더 많은 comparator/mux)<br><br>
        <strong>Block Size 증가 ↑</strong><br>
        Compulsory Miss ↓ (spatial locality 더 많이 포착)<br>
        Conflict Miss ↑ (block 수 감소로 충돌 증가)<br>
        Miss penalty ↑ (더 큰 block을 memory에서 가져와야 함)<br><br>
        <strong>Replacement Policy 개선</strong><br>
        (LRU > FIFO > Random) 이론적 miss rate ↓<br>
        단, hardware cost ↑. Second-order effect (Miss 시에만 동작)
      </p>
    </div>
    <div class="key">
      💡 <strong>요약 표</strong><br>
      ↑ Cache size → Capacity/Conflict miss ↓, Hit time ↑<br>
      ↑ Associativity → Conflict miss ↓, Hardware cost ↑<br>
      ↑ Block size → Compulsory miss ↓, Conflict miss ↑, Miss penalty ↑
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 7</span>
    <h2>Multilevel Cache 설계 — L1 vs L2 역할 분담</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>L1 Cache: Hit time 최소화</h4>
      <p>
        • 작고 빠른 구조 (16~64KB 수준)<br>
        • L1 miss → L2 확인이므로, L1 miss penalty = L2 access time (짧음)<br>
        • 따라서 L1을 소형화하여 hit time을 줄이는 전략이 유효<br>
        • 보통 Write-Through로 단순하게 구현<br>
        • Split I$ + D$ 구조: instruction fetch와 data access를 병렬 처리
      </p>
    </div>
    <div class="explain">
      <h4>L2 Cache: Miss rate 최소화</h4>
      <p>
        • L1보다 크고 느림 (500KB~8MB 수준)<br>
        • L2 miss → DRAM 접근이므로 miss penalty가 매우 큼<br>
        • 따라서 L2는 최대한 크게 만들어 global miss rate를 낮추는 것이 목표<br>
        • Unified I+D$ 구조로 capacity를 유연하게 사용<br>
        • 보통 Write-Back으로 DRAM traffic 최소화
      </p>
    </div>
    <div class="explain">
      <h4>Inclusion Policy</h4>
      <p>
        <strong>Inclusive Cache</strong>: L1에 있는 data는 L2에도 있음<br>
        장점: coherence 확인 시 L2만 검사하면 됨<br>
        단점: L1과 L2에 중복 저장 → 실효 용량 감소<br><br>
        <strong>Exclusive Cache</strong>: L1과 L2가 서로 다른 data 보유<br>
        장점: 전체 cache capacity를 효율적으로 사용<br>
        단점: L1 miss 시 L1↔L2 간 line swap 필요 (복잡)<br>
        예: AMD Athlon (64KB L1 + 256KB L2)
      </p>
    </div>
    <div class="key">
      💡 L1: 작고 빠름 (Hit time 집중) · Write-Through · Split<br>
      L2: 크고 느림 (Miss rate 집중) · Write-Back · Unified
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 8</span>
    <h2>주소 계산 종합 연습 (64KB Cache 설계)</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>문제: 64KB Cache, 1024 blocks → 주소 분할 계산</h4>
      <p>
        <strong>기본 계산</strong><br>
        Block size = 64KB ÷ 1024 = 64 bytes → offset = log₂(64) = <strong>6 bits</strong><br><br>
        <strong>Direct-Mapped (1-way)</strong><br>
        Sets = 1024 ÷ 1 = 1024 → index = log₂(1024) = <strong>10 bits</strong><br>
        32-bit address: tag = 32 - 10 - 6 = <strong>16 bits</strong><br><br>
        <strong>2-way Set Associative</strong><br>
        Sets = 1024 ÷ 2 = 512 → index = log₂(512) = <strong>9 bits</strong><br>
        tag = 32 - 9 - 6 = <strong>17 bits</strong><br><br>
        <strong>4-way Set Associative</strong><br>
        Sets = 1024 ÷ 4 = 256 → index = <strong>8 bits</strong>, tag = <strong>18 bits</strong><br><br>
        <strong>Fully Associative (1024-way)</strong><br>
        Sets = 1 → index = <strong>0 bits</strong>, tag = 32 - 0 - 6 = <strong>26 bits</strong>
      </p>
    </div>
    <div class="key">
      💡 Associativity ↑ → Sets ↓ → Index bits ↓ → Tag bits ↑ (일정한 offset 유지)<br>
      총 Cache 크기는 같아도 주소 분할 방식이 달라진다.
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 9</span>
    <h2>Lec 8 전체 연결 맵</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>개념 흐름 요약</h4>
      <p>
        <strong>① 문제</strong>: Direct-Mapped Cache의 Thrashing (Conflict Miss)<br>
        ↓<br>
        <strong>② 해결</strong>: Set Associativity 도입 → block이 여러 위치 중 하나에 들어갈 수 있음<br>
        ↓<br>
        <strong>③ 대가</strong>: Hardware cost 증가 (comparator N개, mux 필요)<br>
        ↓<br>
        <strong>④ 최적점</strong>: 2~4 way에서 대부분의 conflict miss 해결, 그 이상은 diminishing returns<br>
        ↓<br>
        <strong>⑤ 성능 지표</strong>: AMAT = Hit time + Miss rate × Miss penalty<br>
        ↓<br>
        <strong>⑥ Miss 원인 분류</strong>: Compulsory / Capacity / Conflict (3C)<br>
        ↓<br>
        <strong>⑦ 다중 레벨</strong>: L1(hit time) + L2(miss rate)로 역할 분담<br>
        ↓<br>
        다음 강의: Virtual Memory (Lec 9) - DRAM을 Disk의 Cache로
      </p>
    </div>
    <div class="key">
      💡 <strong>시험 직전 체크리스트</strong><br>
      □ 3가지 Placement Policy와 배치 공식 (mod 연산) 설명 가능한가?<br>
      □ N-way에서 주소 분할 (sets = blocks/N, index bits = log₂(sets)) 계산 가능한가?<br>
      □ AMAT 공식으로 성능 계산 가능한가?<br>
      □ 3C Miss 분류 (Compulsory/Capacity/Conflict) 구분 가능한가?<br>
      □ Local miss rate vs Global miss rate 차이 설명 가능한가?<br>
      □ L1과 L2의 설계 목표 차이 (hit time vs miss rate) 설명 가능한가?<br>
      □ Inclusive vs Exclusive cache 차이 설명 가능한가?
    </div>
  </div>
</div>
`;

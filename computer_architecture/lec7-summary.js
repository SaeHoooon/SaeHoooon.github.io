window.lectureData = window.lectureData || {};
window.lectureData["L7S"] = `
<div class="lec-hero">
  <div class="hero-badge">Lecture 7 · Summary</div>
  <h1 class="hero-title">Memory Hierarchy & Direct Mapped Cache</h1>
  <p class="hero-sub">Lec 7-1 + 7-2 핵심 개념 · 공식 · 계산법 총정리</p>
  <div class="hero-meta">
    <span>📚 Computer Architecture Module 3</span>
    <span>🗂️ Lec 7-1 · 7-2 통합 정리</span>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 1</span>
    <h2>왜 Memory Hierarchy가 필요한가? (CPU-Memory Bottleneck)</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>핵심 문제: CPU는 빠른데 Memory는 느리다</h4>
      <p>
        CPU의 clock cycle: ~1 ns (예: Intel Core i7 Xeon)<br>
        DRAM 접근 시간: ~60 ns<br>
        → CPU는 메모리 하나 읽는 동안 <strong>60 cycle</strong>을 낭비한다.
        <br><br>
        <strong>Latency 문제</strong>: 단일 메모리 접근에 너무 오랜 시간이 걸린다.<br>
        <strong>Bandwidth 문제</strong>: instruction의 m%가 load/store라면 cycle당 (1+m)번의 메모리 참조가 필요하다. CPI=1을 달성하려면 매 cycle마다 (1+m)번의 메모리 접근을 처리해야 하는데, 이것이 불가능하다.
      </p>
    </div>
    <div class="key">
      💡 <strong>Processor–DRAM Gap 계산 예시</strong><br>
      4-issue 2GHz CPU + 100ns DRAM:<br>
      100ns = 200 cycles (@ 2GHz) → 4-issue × 200 = <strong>800 instructions</strong> 실행 가능<br>
      즉, DRAM 한 번 기다리는 동안 CPU는 800개 명령어를 처리할 수 있다.
    </div>
    <div class="callout">
      ⚠️ CPU 성능만 높이면 해결되는 것이 아니다. CPU가 빨라질수록 Memory Bottleneck은 오히려 더 심해진다.
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 2</span>
    <h2>Memory Hierarchy 구조와 Locality</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>메모리 계층 구조 (빠른 순)</h4>
      <p>
        <strong>Register → L1 Cache (SRAM) → L2 Cache (SRAM) → Main Memory (DRAM) → Disk</strong>
        <br><br>
        아래로 갈수록: 크기 ↑ / 속도 ↓ / 비용 ↓ / Block size ↑
        <br><br>
        <strong>계층별 수치 (DEC 21264 @ 700MHz 기준)</strong><br>
        Register: 608B, 1.4ns<br>
        L1 Cache: 128KB, 4.2ns, 4B block<br>
        L2 Cache: 512KB~4MB, 16.8ns, $90/MB, 16B block<br>
        Main Memory: 128MB, 112ns, $2~6/MB, 4~8KB block<br>
        Disk: 27GB, 9ms, $0.01/MB
      </p>
    </div>
    <div class="explain">
      <h4>Locality의 두 종류 — Cache가 효과적인 이유</h4>
      <p>
        <strong>Temporal Locality (시간적 지역성)</strong><br>
        최근에 접근한 data/instruction은 곧 다시 접근될 가능성이 높다.<br>
        예: loop 내부 명령어 반복 실행, sum 변수 반복 갱신<br>
        → Cache에 최근 사용 데이터를 보관하면 효과적<br>
        <br>
        <strong>Spatial Locality (공간적 지역성)</strong><br>
        어떤 주소에 접근하면 그 근처 주소도 곧 접근된다.<br>
        예: a[0], a[1], a[2], ... 순서대로 배열 접근<br>
        → Block 단위로 주변 데이터까지 묶어서 가져오면 효과적<br>
        <br>
        코드 예시: <code>for(i=0; i&lt;n; i++) sum += a[i];</code><br>
        • a[i] 순차 접근 → Spatial Locality<br>
        • loop 명령어 반복 → Temporal Locality<br>
        • sum 반복 갱신 → Temporal Locality
      </p>
    </div>
    <div class="key">
      💡 <strong>Locality가 없다면 Cache는 무의미하다.</strong> Cache가 효과적인 근본 이유는 프로그램이 Locality를 가지기 때문이다.
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 3</span>
    <h2>Cache 기본 개념과 설계 4대 질문</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>Cache 기본 동작</h4>
      <p>
        Main Memory에는 A~Z 전체 데이터가 있고, Cache에는 그 중 일부(자주 쓰는 것)만 저장된다.<br>
        • <strong>Cache Hit</strong>: 원하는 데이터가 Cache에 있음 → 빠르게 반환<br>
        • <strong>Cache Miss</strong>: Cache에 없음 → Main Memory에서 가져와 Cache에 저장<br><br>
        <strong>Block(Line) 단위 저장</strong>: 단일 word가 아니라 여러 word를 묶어 저장 → Spatial Locality 활용
      </p>
    </div>
    <div class="explain">
      <h4>Cache 설계의 4대 핵심 질문</h4>
      <p>
        <strong>1. Line Placement (배치)</strong>: 새로운 memory block을 cache 어디에 놓을 것인가?<br>
        → Direct-Mapped / Set-Associative / Fully-Associative<br><br>
        <strong>2. Line Identification (식별)</strong>: Cache에서 원하는 데이터를 어떻게 찾을 것인가?<br>
        → Tag / Index / Valid bit 구조<br><br>
        <strong>3. Line Replacement (교체)</strong>: Cache가 꽉 찼을 때 무엇을 쫓아낼 것인가?<br>
        → LRU / FIFO / Random<br><br>
        <strong>4. Write Strategy (쓰기 정책)</strong>: Write 연산 발생 시 어떻게 처리할 것인가?<br>
        → Write-through / Write-back
      </p>
    </div>
    <div class="key">
      💡 이 4가지가 Cache 설계의 전체 틀이다. Lec 7-2, 8-1, 8-2에서 배우는 모든 내용은 이 4가지 질문의 답이다.
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 4</span>
    <h2>Direct-Mapped Cache 주소 구조 (핵심 공식)</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>Physical Address의 세 필드 분할</h4>
      <p>
        <code style="font-size:1.05em; background:#e8f0fe; padding:4px 10px; border-radius:4px; display:inline-block;">
          | Tag (t bits) | Set Index (s bits) | Offset (b bits) |
        </code>
        <br><br>
        <strong>Offset (b bits)</strong><br>
        Block 내부에서 몇 번째 byte인지 선택.<br>
        Block size = B = 2<sup>b</sup> bytes → b = log₂(block size)<br><br>
        <strong>Set Index (s bits)</strong><br>
        Cache의 어느 set(line)을 볼지 선택.<br>
        Set 수 = S = 2<sup>s</sup> → s = log₂(sets)<br><br>
        <strong>Tag (t bits)</strong><br>
        선택된 cache entry가 내가 원하는 memory block이 맞는지 확인.<br>
        t = n - s - b (n = 전체 주소 bits)
      </p>
    </div>
    <div class="key">
      💡 <strong>공식 정리</strong><br>
      b = log₂(block size) &nbsp;|&nbsp; s = log₂(number of sets) &nbsp;|&nbsp; t = n − s − b<br>
      Cache 총 크기 = B × S = 2<sup>b+s</sup> bytes<br>
      Direct-Mapped에서 sets = total cache blocks (way = 1)
    </div>
    <div class="explain">
      <h4>계산 예시 ①: 1KB Cache, 1-word (4B) blocks</h4>
      <p>
        총 크기 = 1024 bytes, block size = 4 bytes<br>
        → Block 수 = 1024 / 4 = 256 blocks<br>
        → b = log₂(4) = <strong>2 bits</strong> (offset)<br>
        → s = log₂(256) = <strong>8 bits</strong> (index)<br>
        → t = 32 − 8 − 2 = <strong>22 bits</strong> (tag)
      </p>
    </div>
    <div class="explain">
      <h4>계산 예시 ②: 1KB Cache, 32-byte blocks (Spatial Locality 활용)</h4>
      <p>
        총 크기 = 1024 bytes, block size = 32 bytes<br>
        → Block 수 = 1024 / 32 = 32 blocks<br>
        → b = log₂(32) = <strong>5 bits</strong> (offset)<br>
        → s = log₂(32) = <strong>5 bits</strong> (index)<br>
        → t = 32 − 5 − 5 = <strong>22 bits</strong> (tag)
      </p>
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 5</span>
    <h2>Cache Hit 판단 절차</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>Direct-Mapped Cache에서 데이터를 찾는 절차</h4>
      <p>
        1. 주소에서 <strong>Set Index</strong> bits 추출 → 해당 cache line으로 이동<br>
        2. 해당 line의 <strong>Valid bit 확인</strong>: Valid = 0이면 즉시 Miss<br>
        3. 해당 line의 <strong>Tag와 주소의 Tag 비교</strong>: 불일치 → Miss<br>
        4. Valid = 1 AND Tag 일치 → <strong>Cache Hit!</strong><br>
        5. Hit이면 <strong>Offset</strong> bits로 block 내 원하는 byte/word 선택하여 반환
      </p>
    </div>
    <div class="key">
      💡 <strong>Hit 조건</strong> = (Valid == 1) AND (Tag == 주소의 Tag 필드)<br>
      둘 중 하나라도 실패 → Miss!
    </div>
    <div class="callout">
      ⚠️ Tag만 맞아도 hit가 아니다. Valid bit = 1 조건을 반드시 같이 확인해야 한다. Cache 처음 켜질 때 valid = 0이라 쓰레기값을 hit로 오인하는 실수를 막는다.
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 6</span>
    <h2>Thrashing (Cache 충돌) — 핵심 연산 예시</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>Thrashing이란?</h4>
      <p>
        두 개 이상의 자주 쓰는 memory block이 <strong>같은 cache index로 mapping</strong>되어
        서로를 계속 쫓아내는 현상. Direct-Mapped Cache에서 가장 심각하다.
      </p>
    </div>
    <div class="explain">
      <h4>Dot Product 예시 (DEC Station 5000, 64KB cache, 16B line)</h4>
      <p>
        코드: <code>sum += x[i] * y[i];</code><br>
        float = 4 bytes, line size = 16 bytes → line 하나에 float 4개<br><br>
        <strong>Good Case (x[ ]와 y[ ]가 다른 cache line에 mapping)</strong><br>
        접근: x[0] miss → x[0~3] 로드 / y[0] miss → y[0~3] 로드 / x[1] <em>hit</em> / y[1] <em>hit</em> / ...<br>
        Miss rate = 2/8 = <strong>25%</strong><br>
        시간 = 10 + 0.25 × 2 × 28 = <strong>24 cycles/iteration</strong><br><br>
        <strong>Bad Case (x[ ]와 y[ ]가 같은 cache line에 mapping)</strong><br>
        접근: x[0] miss → x 로드 / y[0] miss → x 쫓겨남, y 로드 / x[1] miss → y 쫓겨남, x 로드 / ...<br>
        Miss rate = 8/8 = <strong>100%</strong><br>
        시간 = 10 + 1.0 × 2 × 28 = <strong>66 cycles/iteration</strong>
      </p>
    </div>
    <div class="key">
      💡 <strong>성능 공식</strong><br>
      Average time/iteration = Loop time + Miss rate × Memory accesses/iter × Miss penalty<br>
      Good: 10 + 0.25 × 2 × 28 = <strong>24</strong> cycles &nbsp;|&nbsp; Bad: 10 + 1.0 × 2 × 28 = <strong>66</strong> cycles<br>
      → 같은 코드인데 데이터 배치 하나로 성능이 <strong>2.75배</strong> 차이남!
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 7</span>
    <h2>Write Policy 완전 정리</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>Cache Hit 시 Write 정책</h4>
      <p>
        <strong>Write-Through</strong><br>
        Cache와 Memory에 동시에 쓴다.<br>
        장점: Memory가 항상 최신 → coherence 단순, 구현 쉬움<br>
        단점: 매 write마다 Memory 접근 → traffic 증가, 느림<br>
        보완: Write Buffer를 두어 CPU blocking 방지<br><br>
        <strong>Write-Back</strong><br>
        Cache에만 쓴다. Block이 evict될 때만 Memory에 씀.<br>
        장점: Memory traffic 대폭 감소<br>
        단점: Dirty bit 필요, coherence 복잡, error recovery 어려움
      </p>
    </div>
    <div class="explain">
      <h4>Cache Miss 시 Write 정책</h4>
      <p>
        <strong>Write-Allocate (= Fetch on Write)</strong><br>
        Memory block을 Cache에 먼저 가져온 후 쓴다.<br>
        → Write-Back과 주로 함께 사용<br><br>
        <strong>No-Write-Allocate (= Write-Around)</strong><br>
        Cache에 가져오지 않고 Memory에 직접 쓴다.<br>
        → Write-Through와 주로 함께 사용
      </p>
    </div>
    <div class="key">
      💡 <strong>흔한 조합</strong><br>
      Write-Through + No-Write-Allocate (단순한 구조, L1에 많이 사용)<br>
      Write-Back + Write-Allocate (효율적, L2에 많이 사용)
    </div>
  </div>
</div>

<!-- ─────────────────────────────────────── -->
<div class="section">
  <div class="sec-hd">
    <span class="slide-num">Topic 8</span>
    <h2>Lec 7 전체 연결 맵</h2>
  </div>
  <div class="sec-body">
    <div class="explain">
      <h4>개념 흐름 요약</h4>
      <p>
        <strong>① 문제 인식</strong>: CPU는 빠른데 Memory는 느리다 (Processor-DRAM Gap)<br>
        ↓<br>
        <strong>② 해결 방향</strong>: Locality를 활용하면 작은 Cache로도 대부분의 접근을 처리할 수 있다<br>
        ↓<br>
        <strong>③ 구조 결정</strong>: Memory Hierarchy (Register → Cache → DRAM → Disk)<br>
        ↓<br>
        <strong>④ Cache 설계</strong>: 4대 질문 (Placement / Identification / Replacement / Write)<br>
        ↓<br>
        <strong>⑤ 가장 단순한 구현</strong>: Direct-Mapped Cache (Tag | Index | Offset)<br>
        ↓<br>
        <strong>⑥ 약점 확인</strong>: Thrashing → Block size 증가해도 conflict 가능성 있음<br>
        ↓<br>
        다음 강의: Set-Associative Cache (Lec 8-1)로 Thrashing 완화
      </p>
    </div>
    <div class="key">
      💡 <strong>시험 직전 체크리스트</strong><br>
      □ Latency vs Bandwidth 차이 설명 가능한가?<br>
      □ Temporal vs Spatial Locality 예시를 들 수 있는가?<br>
      □ Tag / Index / Offset 계산 (주소 bit 분할) 할 수 있는가?<br>
      □ Hit 조건 (Valid=1 AND Tag 일치) 기억하는가?<br>
      □ Thrashing 상황의 miss rate 계산 공식 알고 있는가?<br>
      □ Write-through vs Write-back 차이 설명 가능한가?
    </div>
  </div>
</div>
`;

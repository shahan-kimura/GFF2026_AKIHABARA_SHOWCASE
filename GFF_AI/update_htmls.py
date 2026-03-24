import os, glob

base_dir = r'c:\repos\Antigravity\GFF_AI'
teams = ['1', '2', '4', '5', '6']

for t in teams:
    html_file = os.path.join(base_dir, f'team{t}.html')
    cwf_dir = os.path.join(base_dir, f'Team{t}', 'ConceptWorkFlow')
    
    if os.path.exists(cwf_dir):
        imgs = [os.path.basename(p) for p in glob.glob(os.path.join(cwf_dir, '*.png'))]
    else:
        imgs = []
        
    img_html = '\n          '.join([f'<img src=\"Team{t}/ConceptWorkFlow/{img}\" alt=\"Concept {i+1}\" class=\"workflow-image\" loading=\"lazy\">' for i, img in enumerate(imgs)])
    
    workflow_html = f'''
    <section class="workflow-section">
      <h3 class="workflow-section-title" style="font-size: 1.2rem; margin-bottom: 24px;">— CONCEPT WORKFLOW —</h3>
      <div class="workflow-step">
        <div class="workflow-step-num">PRODUCTION PROCESS</div>
        <p class="workflow-step-desc">このチームのAI_3Dステージ制作におけるコンセプト検証とアセット生成の過程（ワークフロー）です。生成AIを用いてイメージを具体化し、3D空間へと落とし込みました。</p>
        <div class="workflow-gallery">
          {img_html}
        </div>
      </div>
    </section>
    '''

    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'class="workflow-section"' not in content:
        content = content.replace('<section class="gallery-section">', workflow_html + '\n    <section class="gallery-section">')
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated team{t}.html')
